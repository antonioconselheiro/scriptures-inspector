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
          maintainer: 'António Conselheiro',
          mimeType: ['application/vnd.scriptures-inspector.xenoglosproj+json'],
          depends: ['shared-mime-info'],
          scripts: {
            postinst: path.resolve(__dirname, 'packaging/debian/postinst'),
            postrm: path.resolve(__dirname, 'packaging/debian/postrm'),
          },
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
