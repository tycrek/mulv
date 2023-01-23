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
		.then((res) => res.json())
		.then((json) => json.id)
		.then(resolve)
		.catch(reject));

/**
 * Gets a player skin using Mojang API's
 */
const getSkin = (username) => new Promise((resolve, reject) =>
	fetch(MOJANG_API.UUID.concat(username))
		.then((uuidResponse) => {
			console.log(uuidResponse);
			// If code is HTTP 204, username is not valid
			if (uuidResponse.status === 204) throw new Error('Username not found');
			return fetch(MOJANG_API.SKIN.concat(uuidResponse.data.id));
		})
		.then((profileResponse) => Buffer.from(profileResponse.data.properties[0].value, 'base64').toString('ascii'))
		.then((buffer) => fetch(JSON.parse(buffer).textures.SKIN.url, { responseType: 'arraybuffer' }))
		.then((imageResponse) => /*sharp(Buffer.from(imageResponse.data, 'base64'))*/ imageResponse.data)
		.then(resolve)
		.catch(reject));

export default function handler(request, response) {
	const username = request.query.username;
	const type = request.query.type || 'uuid';

	getUuid(username).then((uuid) => response.status(200).json({ uuid })).catch((err) => (console.error(err), response.status(500).json({ err })));
}
