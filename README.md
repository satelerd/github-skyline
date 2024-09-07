# GitHub Skyline

Inspired by [Github Skyline](https://skyline.github.com) (2021, discontinued)

This repo is a fork of a fork of a fork of a fork of a fork of the original Github project replicated by [github.com/jasonlong](https://github.com/jasonlong)...

<br>

## Features

- Uses GitHub's GraphQL API to get up-to-date data

- Renders GitHub contributions as a skyline using three.js

- Exports as STL for 3D printing

<br>

## Usage

1. Clone the repo

<br>

2. Edit the `js/contributions.js` file (line 8) and add your GitHub token:

   ```javascript
   const config = {
     GITHUB_TOKEN: '<YOUR_GITHUB_TOKEN>'
   };
   ```

   You can create a GitHub token [here](https://github.com/settings/tokens).

<br>

3. Run a local server:

   ```
   python -m http.server 8000
   ```

<br>

4. Check your skyline at:

   ```
   http://localhost:8000/?username=<github_user>&year=<YYYY>
   ```

   Replace `<github_user>` and `<YYYY>`. Example:

   ```
   ?username=satelerd&year=2021
   ```