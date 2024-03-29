/**
 * Mojang API endpoints
 */
export const MOJANG_API = {
	/**
	 * Accepts either a username or UUID and returns both from Mojang
	 */
	UUID: 'https://api.mojang.com/users/profiles/minecraft/',

	/**
	 * Only accepts a UUID. Returns the profile data, containing the URL of the skin
	 */
	SKIN: 'https://sessionserver.mojang.com/session/minecraft/profile/'
};

const getUuid = (username) => new Promise((resolve, reject) =>
	fetch(MOJANG_API.UUID.concat(username))
		.then((res) => {
			if (res.status === 204 || res.status === 404) throw new Error('Username not found');
			return res.json();
		})
		.then((json) => json.id)
		.then(resolve)
		.catch(reject));

const getTextures = (uuid, type) => new Promise((resolve, reject) =>
	fetch(MOJANG_API.SKIN.concat(uuid))
		.then((res) => res.json())
		.then((profile) => Buffer.from(profile.properties[0].value, 'base64').toString('ascii'))
		.then((buf) => JSON.parse(buf).textures[type.toUpperCase()].url)
		.then((url) => fetch(url))
		.then((res) => res.arrayBuffer())
		.then((buf) => Buffer.from(buf, 'base64'))
		.then(resolve)
		.catch(reject));

const errHandler = (err, response) => {
	console.error(err);
	return response.status(err.message === 'Username not found' ? 404 : 500).json({ err: err.message });
}

export default function handler(request, response) {
	const username = request.query.username;
	const type = request.query.type || 'uuid';

	// Fix CORS
	response.setHeader('Access-Control-Allow-Origin', '*');

	if (!username || username.length < 1)
		return response.status(400).json({ err: 'No username provided' });
	else if (type === 'uuid')
		getUuid(username)
			.then((uuid) => response.json({ uuid }))
			.catch((err) => errHandler(err, response));
	else
		getUuid(username)
			.then((uuid) => getTextures(uuid, type))
			.then((skinData) => {
				response.setHeader('Cache-Control', 's-maxage=10800');
				response.setHeader('Content-Type', 'image/png');
				response.setHeader('Content-Disposition', `filename=${username}${type === 'cape' ? '-cape' : ''}.png;`);
				response.send(skinData);
			})
			.catch((err) => errHandler(err, response));
}
