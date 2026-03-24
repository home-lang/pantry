import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'netpbm.sourceforge.net',
  name: 'netpbm.sourceforge',
  description: 'Image manipulation',
  homepage: 'https://netpbm.sourceforge.net/',
  programs: ['411toppm', 'asciitopgm', 'atktopbm', 'avstopam', 'bioradtopgm', 'bmptopnm', 'brushtopbm', 'cameratopam', 'cistopbm', 'cmuwmtopbm', 'ddbugtopbm', 'escp2topbm', 'eyuvtoppm', 'fiascotopnm', 'fitstopnm', 'fstopgm', 'gemtopnm', 'giftopnm', 'gouldtoppm', 'hdifftopam', 'hipstopgm', 'ilbmtoppm', 'imgtoppm', 'infotopam', 'jbigtopnm', 'jpeg2ktopam', 'jpegtopnm', 'leaftoppm', 'lispmtopgm', 'macptopbm', 'mdatopbm', 'mgrtopbm', 'mrftopbm', 'mtvtoppm', 'neotoppm', 'palmtopnm', 'pamaddnoise', 'pamarith', 'pambackground', 'pambayer', 'pamchannel', 'pamcomp', 'pamcrater', 'pamcut', 'pamdeinterlace', 'pamdepth', 'pamdice', 'pamditherbw', 'pamedge', 'pamendian', 'pamenlarge', 'pamexec', 'pamfile', 'pamfix', 'pamflip', 'pamfunc', 'pamgauss', 'pamgradient', 'pamlookup', 'pammasksharpen', 'pammixinterlace', 'pammosaicknit', 'pamoil', 'pampaintspill', 'pamperspective', 'pampick', 'pampop9', 'pamrecolor', 'pamrubber', 'pamscale', 'pamseq', 'pamshadedrelief', 'pamsharpmap', 'pamsharpness', 'pamsistoaglyph', 'pamslice', 'pamsplit', 'pamstack', 'pamstereogram', 'pamstretch', 'pamsumm', 'pamsummcol', 'pamthreshold', 'pamtilt', 'pamtoavs', 'pamtodjvurle', 'pamtofits', 'pamtogif', 'pamtohdiff', 'pamtohtmltbl', 'pamtojpeg2k', 'pamtompfont', 'pamtooctaveimg', 'pamtopam', 'pamtopdbimg', 'pamtopfm', 'pamtopng', 'pamtopnm', 'pamtosrf', 'pamtosvg', 'pamtotga', 'pamtotiff', 'pamtouil', 'pamtowinicon', 'pamtoxvmini', 'pamundice', 'pamunlookup', 'pamvalidate', 'pamwipeout', 'pbmclean', 'pbmlife', 'pbmmake', 'pbmmask', 'pbmminkowski', 'pbmpage', 'pbmpscale', 'pbmreduce', 'pbmtext', 'pbmtextps', 'pbmto10x', 'pbmto4425', 'pbmtoascii', 'pbmtoatk', 'pbmtobbnbg', 'pbmtocis', 'pbmtocmuwm', 'pbmtodjvurle', 'pbmtoepsi', 'pbmtoepson', 'pbmtoescp2', 'pbmtog3', 'pbmtogem', 'pbmtogo', 'pbmtoibm23xx', 'pbmtolj', 'pbmtoln03', 'pbmtolps', 'pbmtomacp', 'pbmtomatrixorbital', 'pbmtomda', 'pbmtomgr', 'pbmtomrf', 'pbmtonokia', 'pbmtopgm', 'pbmtopi3', 'pbmtopk', 'pbmtoplot', 'pbmtoppa', 'pbmtopsg3', 'pbmtoptx', 'pbmtosunicon', 'pbmtowbmp', 'pbmtoxbm', 'pbmtoybm', 'pbmtozinc', 'pc1toppm', 'pcxtoppm', 'pdbimgtopam', 'pfmtopam', 'pgmabel', 'pgmbentley', 'pgmdeshadow', 'pgmenhance', 'pgmhist', 'pgmkernel', 'pgmmake', 'pgmmedian', 'pgmminkowski', 'pgmmorphconv', 'pgmnoise', 'pgmramp', 'pgmtexture', 'pgmtofs', 'pgmtolispm', 'pgmtopbm', 'pgmtopgm', 'pgmtoppm', 'pgmtosbig', 'pgmtost4', 'pi1toppm', 'pi3topbm', 'picttoppm', 'pjtoppm', 'pktopbm', 'pngtopam', 'pnmalias', 'pnmcat', 'pnmcolormap', 'pnmconvol', 'pnmcrop', 'pnmgamma', 'pnmhisteq', 'pnmhistmap', 'pnmindex', 'pnminvert', 'pnmmercator', 'pnmmontage', 'pnmnlfilt', 'pnmnorm', 'pnmpad', 'pnmpaste', 'pnmpsnr', 'pnmremap', 'pnmrotate', 'pnmscalefixed', 'pnmshear', 'pnmsmooth', 'pnmstitch', 'pnmtile', 'pnmtoddif', 'pnmtofiasco', 'pnmtojbig', 'pnmtojpeg', 'pnmtopalm', 'pnmtopclxl', 'pnmtopng', 'pnmtops', 'pnmtorast', 'pnmtorle', 'pnmtosgi', 'pnmtosir', 'pnmtotiffcmyk', 'pnmtoxwd', 'ppm3d', 'ppmbrighten', 'ppmchange', 'ppmcie', 'ppmcolormask', 'ppmcolors', 'ppmdcfont', 'ppmdim', 'ppmdist', 'ppmdither', 'ppmdmkfont', 'ppmdraw', 'ppmflash', 'ppmforge', 'ppmglobe', 'ppmhist', 'ppmlabel', 'ppmmake', 'ppmmix', 'ppmntsc', 'ppmpat', 'ppmrelief', 'ppmrough', 'ppmshift', 'ppmspread', 'ppmtoacad', 'ppmtoapplevol', 'ppmtoarbtxt', 'ppmtoascii', 'ppmtobmp', 'ppmtoeyuv', 'ppmtogif', 'ppmtoicr', 'ppmtoilbm', 'ppmtoleaf', 'ppmtolj', 'ppmtomitsu', 'ppmtompeg', 'ppmtoneo', 'ppmtopcx', 'ppmtopgm', 'ppmtopi1', 'ppmtopict', 'ppmtopj', 'ppmtopjxl', 'ppmtoppm', 'ppmtopuzz', 'ppmtorgb3', 'ppmtosixel', 'ppmtospu', 'ppmtoterm', 'ppmtowinicon', 'ppmtoxpm', 'ppmtoyuv', 'ppmtoyuvsplit', 'ppmtv', 'psidtopgm', 'pstopnm', 'qrttoppm', 'rasttopnm', 'rawtopgm', 'rawtoppm', 'rgb3toppm', 'rlatopam', 'rletopnm', 'sbigtopgm', 'sgitopnm', 'sirtopnm', 'sldtoppm', 'spctoppm', 'spottopgm', 'sputoppm', 'srftopam', 'st4topgm', 'sunicontopnm', 'svgtopam', 'tgatoppm', 'thinkjettopbm', 'tifftopnm', 'wbmptopbm', 'winicontopam', 'winicontoppm', 'xbmtopbm', 'ximtoppm', 'xpmtoppm', 'xvminitoppm', 'xwdtopnm', 'ybmtopbm', 'yuvsplittoppm', 'yuvtoppm', 'yuy2topam', 'zeisstopnm'],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/netpbm/super_stable/{{version}}/netpbm-{{version}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'github.com/jasper-software/jasper': '*',
    'libjpeg-turbo.org': '*',
    'libpng.org': '*',
    'simplesystems.org/libtiff': '*',
    'gnome.org/libxml2': '*',
    'zlib.net': '*',
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'github.com/westes/flex': '*',
  },

  build: {
    script: [
      'sed -e \'s|TIFFLIB = NONE|TIFFLIB = -ltiff|g\' \\',
      '    -e \'s|JPEGLIB = NONE|JPEGLIB = -ljpeg|g\' \\',
      '    -e \'s|PNGLIB = NONE|PNGLIB = -lpng|g\' \\',
      '    -e \'s|ZLIB = NONE|ZLIB = -lz|g\' \\',
      '    -e \'s|JASPERLIB = NONE|JASPERLIB = -ljasper|g\' \\',
      '    config.mk.in >config.mk',
      '',
      'sed -i \\',
      '    -e \'s|CFLAGS_SHLIB = |CFLAGS_SHLIB = -fno-common|g\' \\',
      '    -e \'s|NETPBMLIBTYPE = unixshared|NETPBMLIBTYPE = dylib|g\' \\',
      '    -e \'s|NETPBMLIBSUFFIX = so|NETPBMLIBSUFFIX = dylib|g\' \\',
      '    -e \'s|LDSHLIB = -shared -Wl,-soname,$(SONAME)|LDSHLIB = --shared -o $(SONAME)|g\' \\',
      '    config.mk',
      '',
      'sed -i \'s|CFLAGS_SHLIB = |CFLAGS_SHLIB = -fPIC|g\' config.mk',
      'make --jobs {{hw.concurrency}}',
      'make --jobs {{hw.concurrency}} package pkgdir=$SRCROOT/stage',
      'cd "stage"',
      'mkdir -p {{prefix}}',
      'mv bin include lib misc {{prefix}}/',
      '',
      'mkdir -p {{prefix}}/lib/pkgconfig',
      'cp $PROP {{prefix}}/lib/pkgconfig/netpbm.pc',
      '',
    ],
    env: {
      'CFLAGS': '-Wno-implicit-function-declaration $CFLAGS',
    },
  },
}
