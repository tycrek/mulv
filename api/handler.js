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
			if (res.status === 204) throw new Error('Username not found');
			return res.json();
		})
		.then((json) => json.id)
		.then(resolve)
		.catch(reject));

/**
 * Gets a player skin using Mojang API's
 */
const getSkin = (uuid) => new Promise((resolve, reject) =>
	fetch(MOJANG_API.SKIN.concat(uuid))
		.then((res) => res.json())
		.then((profile) => Buffer.from(profile.properties[0].value, 'base64').toString('ascii'))
		.then((buffer) => (console.log(buffer),fetch(JSON.parse(buffer).textures.SKIN.url)))
		.then((res) => res.json())
		.then((json) => (console.log(json), json))
		//.then((imageResponse) => /*sharp(Buffer.from(imageResponse.data, 'base64'))*/ imageResponse.data)
		.then(resolve)
		.catch(reject));

export default function handler(request, response) {
	const username = request.query.username;
	const type = request.query.type || 'uuid';

	if (type === 'uuid')
		getUuid(username)
			.then((uuid) => response.status(200).json({ uuid }))
			.catch((err) => (console.error(err), response.status(500).json({ err: err.message })));
	else
		getUuid(username)
			.then(getSkin)
			.then((skinData) => response.status(200).json({ skin: skinData }))
			.catch((err) => (console.error(err), response.status(500).json({ err: err.message })));
}
