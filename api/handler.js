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
	response.status(200).json({
		body: 'request',
		query: request.query,
		cookies: request.cookies,
	});
}
