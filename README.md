# mechant

## Build Setup

```bash
# install dependencies
$ yarn add ./gsap-bonus.tgz
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## Special Directories

You can create the following extra directories, some of which have special behaviors. Only `pages` is required; you can delete them if you don't want to use their functionality.

### `assets`

The assets directory contains your uncompiled assets such as Stylus or Sass files, images, or fonts.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/assets).

### `components`

The components directory contains your Vue.js components. Components make up the different parts of your page and can be reused and imported into your pages, layouts and even other components.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/components).

### `layouts`

Layouts are a great help when you want to change the look and feel of your Nuxt app, whether you want to include a sidebar or have distinct layouts for mobile and desktop.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/layouts).


### `pages`

This directory contains your application views and routes. Nuxt will read all the `*.vue` files inside this directory and setup Vue Router automatically.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/get-started/routing).

### `plugins`

The plugins directory contains JavaScript plugins that you want to run before instantiating the root Vue.js Application. This is the place to add Vue plugins and to inject functions or constants. Every time you need to use `Vue.use()`, you should create a file in `plugins/` and add its path to plugins in `nuxt.config.js`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/plugins).

### `static`

This directory contains your static files. Each file inside this directory is mapped to `/`.

Example: `/static/robots.txt` is mapped as `/robots.txt`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/static).

### `store`

This directory contains your Vuex store files. Creating a file in this directory automatically activates Vuex.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/store).


# Node
v16.11.0

---

## Storage des preview videos — Cloudflare R2

Les vidéos de preview (hover sur les pages works) sont stockées sur **Cloudflare R2**
(et plus sur Supabase Storage) pour profiter de l'egress gratuite.

### Architecture

- **Upload (admin)** : le browser appelle `/api/r2/presign` → reçoit une URL signée
  → upload direct vers R2. Aucune bande passante consommée côté Vercel.
- **Lecture (public)** : les URLs `https://pub-xxx.r2.dev/previews/*.mp4` sont servies
  directement par Cloudflare, gratuitement.
- **DB** : la table `projects` stocke ces URLs publiques dans `preview_video`.

### Variables d'environnement requises

Dans `.env` (local) et Vercel (production) — voir `.env.sample` :

```
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ENDPOINT
R2_PUBLIC_URL
R2_BUCKET_NAME
```

### Migration des vidéos existantes (Supabase → R2)

Script one-shot pour migrer les vieilles vidéos qui sont encore sur Supabase Storage :

```bash
# Dry-run : montre ce qui serait fait, sans toucher à rien
yarn migrate:r2:dry

# Exécute la migration : download Supabase, upload R2, update DB
yarn migrate:r2:apply
```

Le script skip automatiquement les projets dont `preview_video` est déjà une URL R2.
Idempotent : tu peux le relancer plusieurs fois sans risque.

### Compression des vidéos avant upload

L'admin refuse tout fichier > **5 Mo**. Pour compresser un fichier trop lourd
sans perte visuelle (CRF 22, 1080p, 5s) :

```bash
ffmpeg -i input.mp4 -t 5 -vf "scale='min(1920,iw)':-2" \
  -c:v libx264 -crf 22 -preset veryslow -profile:v high \
  -pix_fmt yuv420p -an -movflags +faststart output.mp4
```

Pour batch un dossier entier (macOS/Linux) :

```bash
mkdir -p compressed
for f in *.mp4 *.mov; do
  [ -f "$f" ] || continue
  ffmpeg -i "$f" -t 5 -vf "scale='min(1920,iw)':-2" \
    -c:v libx264 -crf 22 -preset veryslow -profile:v high \
    -pix_fmt yuv420p -an -movflags +faststart "compressed/${f%.*}.mp4"
done
```