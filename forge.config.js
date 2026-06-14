const path = require('path');

const iconPath = path.resolve(__dirname, 'public', 'script.png');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: iconPath,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: iconPath,
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: iconPath,
        },
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    }
  ],
};
