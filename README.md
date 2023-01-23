<div align="center">

mulv
===

_**M**inecraft **U**UID **L**ookup **V**ercel_

</div>

## What is this?

mulv is a simple API that allows you to lookup a Minecraft player's UUID or grab their skin from their username. It is intended to be hosted on [Vercel](https://vercel.com), because pretty much every other lookup service uses [Cloudflare Workers](https://workers.cloudflare.com), which is [currently globally ratelimited](https://github.com/astei/crafthead/issues/68) by Mojang.

## Usage

If you wish to host this via Vercel yourself (please do, I don't want to have to limit people since I'm only using the free tier), you'll have to set these settings in your Vercel project:

| Name | Value |
| ---- | ----- |
| Framework Preset | Other |
| Build Command | `npm run render` |
| Output Directory | `public` |
| Install Command | `npm i` |

The rest of the settings can be left as default.

## API

The API is very simple and only has one endpoint: **GET `/api/lookup`**. The following query parameters are supported:

| Name | Description |
| ---- | ----------- |
| `username` | The username of the player to lookup. Must be a valid Minecraft Java Edition username. |
| `type?` | The type of data to return. Can be either `uuid` or `skin`. Defaults to `uuid`. |

If an invalid username is provided, the API will return a `400` status code with the following JSON:

```json
{
    "err": "Username not found"
}
```

### Requesting skins

Skins are returned as an **arraybuffer**. Below is a quick example on loading skins with [Axios](https://npmjs.com/package/axios) and [Sharp](https://npmjs.com/package/sharp):

```js
axios.get(`https://mulv.tycrek.dev/api/lookup?type=skin&username=${USERNAME}`, { responseType: 'arraybuffer' })
    .then((res) => sharp(Buffer.from(res.data, 'base64')))
    .then(resolve)
    .catch(reject);
```

### Sample URLs

- [Valid UUID](https://mulv.tycrek.dev/api/lookup?username=tycrek)
- [Valid skin](https://mulv.tycrek.dev/api/lookup?username=tycrek&type=skin)
- [Invalid username](https://mulv.tycrek.dev/api/lookup?username=tycrek123)
- [Invalid skin](https://mulv.tycrek.dev/api/lookup?username=tycrek123&type=skin)
