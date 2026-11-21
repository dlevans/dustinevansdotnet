// ─────────────────────────────────────────────────────────────
//  All site content lives here. Edit this file to update the site.
// ─────────────────────────────────────────────────────────────

import generatedPhotos from './photos.generated.js'

export const profile = {
  siteUrl: 'https://dustinevans.net', // used in link previews
  greeting: 'Hey there',
  firstName: 'Dustin',
  lastName: 'Evans',
  roleLines: ['an Integration Engineer', 'with a decade of', 'building data pipelines & web tools'],
  // Rotating "and I ❤ ___" words in the hero
  loves: [
    'clean SQL 🗄️',
    'automating boring stuff 🤖',
    'React',
    'tinkering with ESP32s 🔌',
    '3D printing 🖨️',
    'cosplay & props ⚔️',
    'the Ren Faire 🏰',
    'solving problems 🧩',
    'building things for fun 🛠️',
  ],
  tagline:
    'I bridge the gap between heavy backend databases and user-facing applications — with C#, advanced SQL, and React.',
  location: 'Kansas City, MO',
  // Search engines: the homepage's browser-tab title and Google snippet.
  // Keep the title under ~65 characters and the description under ~155.
  seoTitle: 'Dustin Evans · Kansas City Software Developer & Integration Engineer',
  seoDescription:
    'Dustin Evans is a Kansas City software developer and integration engineer building data pipelines, web apps, and tools with C#, SQL, and React.',
  jobTitle: 'Integration Engineer', // used in Google's structured data
  coordinates: '39° 05\' 59" N / 94° 34\' 42" W',
  status: {
    open: false, // true = "OPEN TO WORK", false = "NOT LOOKING"
    note: 'Always up for a good conversation or a freelance gig.',
  },
  // Cloudflare Worker that checks Twitch/YouTube/TikTok (see worker/README.md).
  // Empty = the "is live!" badge is off. Add ?live to any URL to preview it.
  liveStatusUrl: 'https://live-status.evansdustin.workers.dev',
  resumeUrl: '', // e.g. '/resume.pdf' (put the PDF in /public)
}

export const about = {
  paragraphs: [
    "I'm an Integration Engineer in Kansas City with a decade of experience architecting secure data pipelines, complex ETL processes, and custom automation tools.",
    'My sweet spot is the space between the database and the person using the app: C#, advanced SQL, and modern web tech like React and JavaScript. I have a track record of diagnosing root causes, optimizing data flow, and building tools that give teams hours back every day.',
    "Outside of work I build full-stack community sites, map apps, and custom hardware — ESP32 and Arduino electronics, 3D-printed enclosures, and props.",
  ],
  skills: [
    'C# / .NET', 'Advanced SQL', 'SQL Server', 'Oracle', 'SSIS', 'SSRS',
    'ETL Pipelines', 'SFTP & PGP', 'React', 'JavaScript', 'Node.js',
    'PostgreSQL', 'HTML & CSS', 'Git', 'Azure DevOps', 'ESP32 / Arduino',
    'Blender', 'Fusion 360',
  ],
}

// Projects — the /projects page shows ALL of these (in this order).
// The home page shows up to 6 marked `featured: true`.
// `linkLabel` (optional) changes the "Live" link text, e.g. 'Facebook'.
// `playStore` (optional) is a Google Play listing URL; adds a "Get it on Google Play" badge.
// `image` is optional — put images in /public/projects/ and reference
// them like '/projects/cosplay.webp'.
// `archived: true` adds an "Archived" badge and includes it in the Archived filter.
// `seoTitle` / `seoDescription` (optional) are what Google shows for the project's
// page; ' · Dustin Evans' is added to the title. Without them, the title and
// description are used. Put the keywords people would search for first.
// `appCategory` (optional) marks the project as an app in Google's structured data,
// e.g. 'GameApplication', 'TravelApplication' (Android if it has `playStore`).
// `slug` + `details` create the project's own page at /projects/<slug>. Cards link
// to that page; the `link`, `repo`, and `playStore` buttons appear on the page.
// Each detail section can have a `heading`, `text`, a list of `items`, and a list of
// `links` ({ label, url }) that open in a new tab.
export const projects = [
  {
    title: 'Midwest Cosplay Club Platform',
    slug: 'midwest-cosplay-club',
    seoTitle: 'Midwest Cosplay Club: Community Site for Kansas City Cosplayers',
    seoDescription:
      'A community site for Kansas City cosplayers: profiles, groups, events, cosplan cards, and a craft store map. Built with React, Node.js, and PostgreSQL.',
    appCategory: 'SocialNetworkingApplication',
    details: [
      {
        heading: 'What it is',
        text: 'Midwest Cosplay Club is a community site for cosplayers around Kansas City and the Midwest. Members make a profile, join groups, plan what they are wearing to upcoming events, and find the local shops that sell the materials they need.',
      },
      {
        heading: 'Features',
        items: [
          'Member profiles with a public page and a QR code to share it at conventions',
          'Groups and events with member lists and a shared calendar',
          'Cosplan cards: add a photo of each character you plan to wear to an event, then download the card as an image with a QR code linking back to the event',
          'A map of fabric and craft stores around Kansas City, built with Leaflet, that members can add to',
          'Libraries of tutorials and patterns that members can contribute to',
          'Maker tools: a body measurement tracker, a scale calculator, and resistor and electrical calculators for props with electronics',
          'Mini-games (Snake, Brick Breaker, Memory, a hacking game, and Sigil Strike) and photo scavenger hunts for convention meetups',
        ],
      },
      {
        heading: 'How it works',
        text: 'The frontend is a React app with React Router. It talks to a Node.js API backed by a PostgreSQL database that stores users, groups, events, stores, tutorials, and hunt progress. Passwords are hashed with bcrypt, and logins use JSON Web Tokens. Photos are cropped and resized in the browser before upload and stored on Cloudinary, so the server never handles full-size images.',
      },
    ],
    description:
      'A full-stack community web app with a React frontend, a Node.js API, and a PostgreSQL database managing user profiles, events, and site content.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    link: 'https://midwestcosplay.club',
    repo: 'https://github.com/dlevans/MidwestCosplay.Club',
    image: '/projects/midwest-cosplay.webp',
    featured: true,
  },
  {
    title: 'Ren Faire GIS Navigator',
    slug: 'ren-faire-gis-navigator',
    seoTitle: 'Ye Old Map: Kansas City Renaissance Festival Map App for Android',
    seoDescription:
      'An offline Android map of the Kansas City Renaissance Festival with live GPS, 300+ vendors, food stands, stages, and bathrooms, plus a parking pin.',
    appCategory: 'TravelApplication',
    details: [
      {
        heading: 'What it is',
        text: "The Kansas City Renaissance Festival covers acres of winding paths, and the paper map is hard to read once you're inside. Ye Old Map is an Android app that shows where you are on the festival grounds and helps you find the turkey legs, the joust, or the nearest bathroom.",
      },
      {
        heading: 'Features',
        items: [
          'More than 300 mapped locations: about 190 vendors, 50 food stands, 15 stages, plus activities, ATMs, bathrooms, entrances, and ticket counters',
          'Separate maps for vendors, food, stages, and bathrooms, so you only see what you are looking for',
          'Search by name, plus a detail page for each location',
          'Live GPS position on the map',
          'Drop a pin where you parked so you can find your car at the end of the day',
          'Themed map artwork (classic, fae, viking, or pirate) and an optional labeled grid in 50-foot squares',
          'Works offline: the whole map is built into the app, so it works even when cell service is spotty',
        ],
      },
      {
        heading: 'How it works',
        text: "I started from county-level GIS data and processed it into map tiles covering just the festival grounds. Those tiles ship inside the app as an MBTiles file, and osmdroid draws them with no internet connection. Illustrated map artwork is pinned on top at the exact coordinates of the grounds, so it lines up with your GPS position. Every location lives in a JSON file with its coordinates, category, and description, which makes it easy to update each season. The app is written in Kotlin and is available on Google Play.",
      },
    ],
    description:
      'An interactive Android map app for navigating complex outdoor event layouts at the Kansas City Ren Faire, built on processed county-level GIS data.',
    tags: ['Android', 'Kotlin', 'GIS', 'Leaflet'],
    link: 'https://kcrfmap.onrender.com/',
    repo: 'https://github.com/dlevans/YeOldMap',
    playStore: 'https://play.google.com/store/apps/details?id=dustin.evans.yeoldmap',
    image: '/projects/ren-faire-map.webp',
  },
  {
    title: 'Laser Sword Builder',
    slug: 'laser-sword-builder',
    seoTitle: 'Laser Sword Builder: Force Alignment Quiz & 3D Saber Designer',
    seoDescription:
      'Take a quick quiz to find out if you lean Jedi, Gray, or Sith, then design your own laser sword in 3D and share it with a link. Runs in your browser.',
    appCategory: 'GameApplication',
    details: [
      {
        heading: 'What it is',
        text: 'A two-part web toy. First, a short Force alignment quiz tells you whether you lean Jedi, Gray, or Sith. Then a 3D builder lets you design the laser sword that goes with your result.',
      },
      {
        heading: 'The quiz',
        text: 'Five questions, each with a light, neutral, and dark answer worth 1, 2, or 3 points. A live counter shows how your answers are adding up. When you submit, your average score decides your fate: Jedi Knight, Gray Jedi, or Sith Lord.',
      },
      {
        heading: 'The builder',
        items: [
          'A 3D hilt you can spin and zoom, made of four swappable sections: emitter, switch, sleeve, and pommel',
          'Pick a color for each section and for the glowing blade',
          'Your quiz result carries over and sets the starting style',
          'A share button copies a link that rebuilds your exact design for whoever opens it',
        ],
      },
      {
        heading: 'How it works',
        text: 'Plain HTML, CSS, and JavaScript with no build step, hosted on GitHub Pages. The builder uses Three.js to load each hilt part as a GLB model and stack them into one saber, with orbit controls for spinning it. Your design is saved entirely in the URL, so sharing needs no database.',
      },
      {
        heading: 'Credits',
        text: 'The laser sword parts used in the builder come from Brass Engine Studio. Check out their work:',
        links: [
          { label: 'Brass Engine Studio website', url: 'https://brassengine.studio/' },
          { label: 'Brass Engine on Etsy', url: 'https://www.etsy.com/shop/BrassEngine' },
          { label: 'Brass Engine on Facebook', url: 'https://www.facebook.com/BrassEngine' },
        ],
      },
    ],
    description:
      'A Force alignment quiz: answer a series of questions to find out if you lean Jedi, Gray, or Sith, then build a lightsaber to match your fate.',
    tags: ['HTML', 'JavaScript', 'CSS'],
    link: 'https://dlevans.github.io/LaserSwordBuilder/',
    repo: 'https://github.com/dlevans/LaserSwordBuilder',
    image: '/projects/laser-sword-builder.webp',
    featured: true,
  },
  {
    title: 'KC X-34 Landspeeder',
    slug: 'kc-x34-landspeeder',
    seoTitle: 'KC X-34 Landspeeder: Full-Size Replica Build in Kansas City',
    seoDescription:
      'A full-size X-34 landspeeder replica built in a Kansas City garage, from concept renders to fabrication. Follow along with the build.',
    details: [
      {
        heading: 'What it is',
        text: 'A full-size replica of the X-34 landspeeder, built here in Kansas City.',
      },
      {
        heading: 'The build',
        text: 'The project started as concept renders and moved into garage fabrication. I post progress photos and updates on the Facebook page as the build comes together.',
      },
    ],
    description:
      'A full-size X-34 landspeeder replica built here in Kansas City — from concept renders to garage fabrication. Follow along with the build.',
    tags: ['Prop Build', 'Fabrication', 'Cosplay'],
    link: 'https://www.facebook.com/people/KC-X-34-Landspeeder/61556613977147/',
    linkLabel: 'Facebook',
    repo: '',
    image: '/projects/landspeeder.webp',
    featured: true,
  },
  {
    title: 'Ghost Scanner',
    slug: 'ghost-scanner',
    seoTitle: "Ghost Scanner: AR Ghost Hunt Game in Your Phone's Browser",
    seoDescription:
      'Print the marker cards, hide them, and scan with your phone to find 3D ghosts. An augmented reality ghost hunt that runs in the browser, no app needed.',
    appCategory: 'GameApplication',
    details: [
      {
        heading: 'What it is',
        text: "A ghost hunt that runs in your phone's browser. Print the marker cards, hide them around the house, and hand someone the scanner. When the camera spots a card, a 3D ghost appears floating on top of it. No app to install.",
      },
      {
        heading: 'Features',
        items: [
          'Seven ghosts to find, including Boo-ris, Sir Spook, The Wailer, and Ghost Malone',
          'Tracks which ghosts you have found so far',
          'Snap a photo with the ghosts in it and save it to your phone',
          'A printable sheet of marker cards',
          'A ghost builder: shape your own ghost, add hats, horns, bows, or a pumpkin, and download it with its own marker, ready to add to the hunt',
        ],
      },
      {
        heading: 'How it works',
        text: "Each card is an ArUco marker, a square black-and-white pattern that's easy for a computer to recognize. Every camera frame goes to js-aruco2, which finds the markers and their four corners. A pose-estimation step (POSIT) turns those corners into the card's position and angle in 3D space. Three.js then places that card's ghost model at the same spot on a transparent layer over the live video, so the ghost stays stuck to the card as you move. It's built with React and Vite.",
      },
    ],
    description:
      'A browser-based augmented reality app: point your phone camera at printed ArUco markers to reveal 3D ghosts hiding on the walls, or build your own ghost.',
    tags: ['React', 'Three.js', 'AR'],
    link: 'https://ghost-scanner-rrgv.onrender.com/',
    repo: 'https://github.com/dlevans/ghost-scanner',
    image: '/projects/ghost-scanner.webp',
    featured: true,
  },

  // Older projects from the previous site, each with its own page.
  {
    title: 'iTable',
    slug: 'itable',
    seoTitle: 'iTable: Handmade Arduino Coffee Table with an iPod Dock',
    image: '/projects/itable.webp',
    description:
      'A handmade coffee table with a built-in iPod dock, built over about a year. My first Arduino project and my first feature on Hack A Day.',
    tags: ['Arduino', 'Fabrication'],
    archived: true,
    details: [
      {
        heading: 'The build',
        text: "I built this coffee table and iPod dock by hand at my friend Damion's house. From start to finish it took around a year.",
      },
      {
        heading: 'Why it matters to me',
        text: 'It was the first thing I ever made with an Arduino, and the first of my projects to get picked up by Hack A Day. The source code has since been lost.',
      },
    ],
  },
  {
    title: 'RetroPie',
    slug: 'retropie',
    seoTitle: 'RetroPie: Raspberry Pi Retro Console with Xbox 360 Controller Setup',
    image: '/projects/retropie.webp',
    description:
      'A ready-to-go Raspberry Pi retro gaming console with a preconfigured image, Xbox 360 wireless controller support, and a step-by-step setup guide.',
    tags: ['Raspberry Pi', 'Retro Gaming'],
    archived: true,
    details: [
      {
        heading: 'Overview',
        text: 'I put together a RetroPie image already configured for an Xbox 360 controller, so a Raspberry Pi could become a retro console in just a few steps. The image did not include any ROMs.',
      },
      {
        heading: 'Hardware',
        text: 'The parts came to less than $150.',
        items: [
          'Raspberry Pi',
          'Xbox 360 controller and wireless adapter',
          'HDMI cable and right-angle adapter',
          'Micro USB cable and power supply',
          'SD card: 4 GB minimum, I used 8 GB to leave room for games',
          'Optional: a Pi case and a nice box from Hobby Lobby to house it',
        ],
      },
      {
        heading: 'Setup',
        items: [
          'Write the image to the SD card with Win32 Disk Imager.',
          'Pair the controller and wireless adapter on a Windows PC, then move the adapter to the Pi.',
          'Insert the SD card, connect network and video, and power on.',
          'If an input config screen appears, leave it alone. The controls are already set up, and pressing start there caused me trouble.',
        ],
      },
    ],
  },
  {
    title: 'LED Goggles',
    slug: 'led-goggles',
    seoTitle: 'Arduino LED Goggles with NeoPixel Rings and Wii Nunchuck Control',
    image: '/projects/led-goggles.webp',
    description:
      "NeoPixel ring goggles driven by an Arduino and a Wii Nunchuck, with buttons for color and the joystick for spin and brightness. Featured on Adafruit's blog.",
    tags: ['Arduino', 'NeoPixel', 'Wearables'],
    archived: true,
    details: [
      {
        heading: 'Overview',
        text: "These goggles combine Adafruit NeoPixel rings, an Arduino, and a Wii Nunchuck as the controller. Adafruit shared a demo of them on its blog, and I wore them to a costume contest put on by SNN:ICT.",
      },
      {
        heading: 'Controls',
        items: [
          'Z button: changes the color of the single moving pixel',
          'C button: changes the color of the whole ring',
          'Hold both buttons: makes the rings "breathe"',
          'Joystick left and right: spins the pixel around the ring',
          'Joystick up and down: adjusts brightness',
        ],
      },
      {
        heading: 'Lesson learned',
        text: 'The first version ran at full brightness all the time, and the rings were bright enough to make people duck. That is why brightness control went in.',
      },
    ],
  },
  {
    title: 'LED Goggles 2',
    slug: 'led-goggles-2',
    seoTitle: 'LED Goggles 2: Adafruit Gemma NeoPixel Goggles',
    image: '/projects/led-goggles-2.webp',
    description:
      'A cleaner redesign built around an Adafruit Gemma, with the electronics hidden inside the goggles and one button for each eye.',
    tags: ['NeoPixel', 'Wearables'],
    archived: true,
    details: [
      {
        heading: 'Why a second pair',
        text: 'The original goggles worked, but their cables were too long, and keeping the Nunchuck in my pocket meant colors changed or people got blinded by accident.',
      },
      {
        heading: 'What changed',
        text: "This pair runs on an Adafruit Gemma, with the electronics tucked inside the goggles. Its three pins are enough for the LED rings plus two buttons, one for each eye. The battery was the only visible part, until I could swap in a smaller LiPo.",
      },
    ],
  },
  {
    title: 'blueNES',
    slug: 'bluenes',
    seoTitle: 'blueNES: Bluetooth NES Controller Adapter Built with Arduino',
    image: '/projects/bluenes.webp',
    description:
      'A broken NES rebuilt as a Bluetooth controller adapter, using an Arduino and BlueSmirf to play on phones and laptops. Featured on Hack A Day.',
    tags: ['Arduino', 'Bluetooth', 'Retro Gaming'],
    archived: true,
    details: [
      {
        heading: 'Overview',
        text: 'The blueNES uses an Arduino and a BlueSmirf Bluetooth module to send input from Nintendo controllers to a connected device. It was my second project featured on Hack A Day.',
      },
      {
        heading: 'The build',
        text: "A friend gave me a broken Nintendo to house the electronics. To avoid cutting up any controllers, I used the Player 1 port and the wiring already inside the console.",
      },
      {
        heading: 'Future ideas',
        text: 'I planned to add Player 2 and Super Nintendo ports, making it ideal for emulators on a phone or laptop.',
      },
    ],
  },
  {
    title: 'blueNES 2',
    slug: 'bluenes-2',
    seoTitle: 'blueNES 2: NES Controller to Bluetooth Keyboard with Bluefruit',
    image: '/projects/bluenes-2.webp',
    description:
      'A simpler follow-up that turns an original NES controller into a Bluetooth keyboard with an Adafruit Bluefruit.',
    tags: ['Bluetooth', 'Retro Gaming'],
    archived: true,
    details: [
      {
        heading: 'How it works',
        text: "This follow-up to the blueNES swaps the Arduino for Adafruit's Bluefruit. Connecting any of pins 0 through 11 to ground sends a keyboard command, so wiring in an old NES controller was all it took.",
      },
    ],
  },
  {
    title: 'Tesseract Case',
    slug: 'tesseract-case',
    seoTitle: 'Tesseract Case: Raspberry Pi Media Player Prop with NeoPixels',
    image: '/projects/tesseract-case.webp',
    description:
      'An Avengers-inspired portable media case with a Raspberry Pi, 7" screen, speakers, and NeoPixels controlled by a custom Android app.',
    tags: ['Raspberry Pi', 'Arduino', 'Android', 'NeoPixel', 'Prop Build'],
    archived: true,
    details: [
      {
        heading: 'Overview',
        text: 'The Avengers is a favorite of mine, and after finding a guide to making a Tesseract I wanted a case to go with it. It doubles as a self-contained media player, built into a case from Harbor Freight.',
      },
      {
        heading: "What's inside",
        items: [
          'Arduino with a spectrum shield and BlueSmirf Bluetooth modem',
          'Raspberry Pi with a WiFi card',
          '7" LCD monitor',
          'Two speakers and a digital amp',
          'Two strips of Adafruit NeoPixels',
        ],
      },
      {
        heading: 'Audio and video',
        text: 'The monitor has two inputs: one for the Pi, through an RCA splitter that also feeds a video output on the side of the case, and one for an RCA coupler that accepts outside sources. Audio is wired the same way, so I could also run it through my living room projector.',
      },
      {
        heading: 'Software',
        text: 'The Pi runs Raspbian with standalone XBMC and broadcasts its own wireless network, so AllCast can send movies from my Nexus 7 without touching the case. I wrote a custom Android app that changes the LEDs over Bluetooth.',
      },
    ],
  },
  {
    title: 'DNA Arcade',
    slug: 'dna-arcade',
    seoTitle: 'DNA Arcade: DIY MDF Arcade Cabinet with NES and SNES Emulators',
    image: '/projects/dna-arcade.webp',
    description:
      'The "Dustin and Nick Arcade": a full-size MDF cabinet powered by a salvaged laptop, with custom software that launches NES and SNES emulators.',
    tags: ['Retro Gaming', 'Fabrication'],
    archived: true,
    details: [
      {
        heading: 'Overview',
        text: 'DNA stands for Dustin and Nick Arcade. The computer came from an old laptop with a broken screen, and the buttons and control board came from Ultimarc. Nick wrote the software that launches the right command-line NES or SNES emulator for the selected game.',
      },
      {
        heading: 'Materials',
        items: [
          'Three 4\' x 8\' sheets of 5/8" MDF and five 8\' 2x2s',
          'Coated screws, caster bolts, wood glue, and optional wood filler',
          'Oil-based primer (water-based paint does not work on MDF) and optional exterior paint',
          'Red and black 18 gauge stranded wire, female disconnects, and a small PCB for grounds',
          'At least 8 arcade buttons, a joystick, and a control driver',
          'Monitor, PC speakers, and a computer (a Raspberry Pi works too)',
          'Optional: UV cold cathode lights, casters, and a plexiglass cover',
        ],
      },
      {
        heading: 'Tools',
        items: [
          'Circular saw and electric drill',
          'Reciprocating saw or handheld router',
          'Soldering iron, wire cutters and strippers, and hot glue gun',
          'Large clamps, and patience',
        ],
      },
    ],
  },
  {
    title: 'Raspberry Pi BB-8',
    slug: 'raspberry-pi-bb8',
    seoTitle: 'Drive a Sphero BB-8 from a Raspberry Pi with an Xbox 360 Controller',
    image: '/projects/raspberry-pi-bb8.webp',
    description:
      'A guide to driving a Sphero BB-8 with an Xbox 360 controller from a Raspberry Pi 2 or 3 over Bluetooth LE, using open-source Python code.',
    tags: ['Raspberry Pi', 'Python', 'Bluetooth'],
    archived: true,
    details: [
      {
        heading: 'Overview',
        text: "After seeing this idea on YouTube, I got a Sphero BB-8 running from a Raspberry Pi with an Xbox 360 controller. It worked on a Pi 2 with a Bluetooth LE dongle and on a Pi 3 with its built-in Bluetooth.",
      },
      {
        heading: 'Credit',
        text: "The code is Joseph Kim's SpheroBB8-python, which builds on work by davinellulinvega and ali1234.",
      },
      {
        heading: 'Getting it running',
        items: [
          'Install Raspbian Jessie, update the system, expand the filesystem, and set the Pi to boot to the console.',
          'Install pip, the GLib development files, and the bluepy Python package.',
          'Download SpheroBB8-python to the Pi.',
          "Scan with hcitool lescan to find the BB-8's MAC address, then add it to BB8_driver.py.",
          'Run BB8test.py. BB-8 lights up white, cycles through colors once connected, and turns orange after disconnecting.',
          'Run BB8joyDrive.py and drive with the Xbox controller.',
        ],
      },
    ],
  },
  {
    title: 'Control Panel',
    slug: 'control-panel',
    seoTitle: 'Control Panel: Key-Switched Arduino NeoPixel Box with Android App',
    image: '/projects/control-panel.webp',
    description:
      'A key-switched Arduino box that controls a NeoPixel strip from an Android app, with a spectrum shield and Bluetooth.',
    tags: ['Arduino', 'Android', 'NeoPixel'],
    archived: true,
    details: [
      {
        heading: 'Overview',
        text: 'Control Panel pairs an Arduino with an Android app to control an Adafruit NeoPixel strip. The total cost was about $130 plus shipping.',
      },
      {
        heading: 'Parts',
        items: [
          'Arduino and NeoPixel strip',
          'BlueSmirf Bluetooth module',
          'Spectrum Shield',
          'Key switch and barrel jack extension cable',
          'An enclosure and a 5V power supply with a center-positive 5.5 x 2.1 mm barrel connector',
        ],
      },
      {
        heading: 'The build',
        items: [
          'Cut openings in the enclosure for the key switch and the power jack.',
          'Split the extension cable, join the grounds, and run the power line through the key switch.',
          'Plug in the Arduino and confirm the key turns it on.',
          'Add the Spectrum Shield and bring power and ground to it.',
          'Wire up the BlueSmirf, the NeoPixel data line, and the remaining power connections.',
        ],
      },
      {
        heading: 'Software',
        text: 'The Android side used Amarino to handle the Bluetooth connection, and the Arduino sketch used a customized MeetAndroid library.',
      },
    ],
  },
]

// Photography — every folder in photos-originals/ becomes a gallery with its own
// page at /photography/<slug>. Folders with no images are hidden automatically.
//
// ADDING PHOTOS / GALLERIES:
//   1. Put camera originals in photos-originals/<Gallery Name>/
//      (a new folder = a new gallery; subfolders become captions,
//       e.g. photos-originals/people/caitlyn/ → caption "Caitlyn")
//   2. Photos are processed automatically while `npm run dev` is running and
//      before every `npm run build`. You can also run it by hand: npm run photos
//   3. With Cloudinary keys in .env, new photos are uploaded to Cloudinary and
//      their URLs saved in photos.generated.js. Commit that file and push.
//
// Optional gallery details, keyed by slug (the folder name in lowercase with
// dashes, e.g. "Night Sky" → 'night-sky'). Galleries listed here appear first,
// in this order; new folders show up after them, alphabetically.
//   title:       display name (default: the folder name, Title Cased)
//   icon:        emoji used on the card if there's no cover photo
//   description: one line shown under the gallery title
//   cover:       a photo name from that gallery, e.g. 'img-1482' (default: the newest photo)
export const albumInfo = {
  people: { title: 'People', icon: '🧑', description: 'Portraits and candids.' },
  'clearly-guilty': { title: 'Clearly Guilty', icon: '🕵️', description: '' }, // TODO: description
  outdoors: { title: 'Outdoors', icon: '🌃', description: 'Kansas City skylines, streets, and night lights.' },
  concerts: { title: 'Concerts', icon: '🎸', description: 'Live music, stage lights, and the crowd.' },
  conventions: { title: 'Conventions', icon: '🎭', description: 'Cosplay, costumes, and con floor chaos.' },
  vehicles: { title: 'Vehicles', icon: '🚗', description: 'Cars, bikes, and things with engines.' },
  other: { title: 'Other', icon: '✨', description: "Everything that doesn't fit anywhere else." },
}

// Optional per-photo details, keyed by "<slug>/<name>" (names are listed in
// src/data/photos.generated.js):
//   caption:  text shown on hover and in the viewer (overrides the subfolder name)
//   alt:      description for screen readers
//   featured: true = also shown on the home page (up to `homeCount`)
//   hidden:   true = skip this photo on the site
export const photoDetails = {
  // 'outdoors/streetcar': { caption: 'KC Streetcar', alt: 'Streetcar downtown at night', featured: true },
}

const titleCase = (s) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
const order = Object.keys(albumInfo)
const rank = (slug) => (order.includes(slug) ? order.indexOf(slug) : order.length)

const albums = generatedPhotos
  .map(({ slug, folder, photos }) => {
    const info = albumInfo[slug] || {}
    const title = info.title || titleCase(folder)
    return {
      slug,
      title,
      icon: info.icon || '📷',
      description: info.description || '',
      cover: photos.find((p) => p.name === info.cover)?.thumb || '',
      photos: photos
        .map((p) => {
          const d = photoDetails[`${slug}/${p.name}`] || {}
          const caption = d.caption ?? (p.group ? titleCase(p.group) : '')
          return { ...p, caption, alt: d.alt ?? (caption ? `${title}: ${caption}` : `${title} photo`), ...d }
        })
        .filter((p) => !p.hidden),
    }
  })
  .filter((a) => a.photos.length) // hide galleries with no (visible) photos
  .sort((a, b) => rank(a.slug) - rank(b.slug) || a.title.localeCompare(b.title))

export const photography = {
  intro: 'People, places, loud shows, and big events — the moments I happened to catch.', // TODO: your own words
  homeCount: 8,
  instagram: 'https://www.instagram.com/dustinevansphoto/', // "More on Instagram" button
  albums,
}

// Every photo across all albums (used for the home page "featured" picks)
export const allPhotos = photography.albums.flatMap((a) => a.photos.map((p) => ({ ...p, album: a.slug })))

export const experience = [
  {
    role: 'Enterprise Integrations',
    company: 'VINCUE',
    period: 'Dec 2025 — Present',
    summary:
      'Architected an internal documentation portal and built custom Chrome extensions for Vincue and HubSpot, saving two teams ~1 hour/day. Maintain the documentation infrastructure that keeps critical workflows discoverable.',
  },
  {
    role: 'Automation Engineer & SQL Report Writer',
    company: 'Berman & Rabin PA',
    period: 'Aug 2025 — Dec 2025',
    summary:
      'Automated the legal document preparation workflow with C# tools that merge SQL records into Word filing templates, eliminating ~2 hours/day of manual lookup per team member. Built scheduled SSRS reports, procs, and functions.',
  },
  {
    role: 'Enterprise Integrations Developer',
    company: 'Neu Analytics',
    period: 'Apr 2021 — Jul 2025',
    summary:
      'Built file-import validation that cut data quality issues by 20%, NSF payment reconciliation, hash-based change detection for delta transmissions, and C# bulk loaders for complex Excel datasets. Authored onboarding guides used across the team.',
  },
  {
    role: 'Data Operations Junior Developer',
    company: 'Neu Analytics',
    period: 'Oct 2018 — Mar 2021',
    summary:
      'Supported automated import/export jobs for enterprise ETL pipelines, fixed imported data issues, managed PGP key rotation, and researched root causes in SQL Server.',
  },
  {
    role: 'Tier II Technical Support',
    company: 'Ad Astra Information Systems',
    period: 'Jun 2015 — Oct 2018',
    summary:
      'Diagnosed issues across SQL Server and Oracle, maintained stored procedures and jobs, refined frontend UI, and configured SSO (LDAP, CAS, ADFS, Shibboleth).',
  },
  {
    role: 'IT Support / Developer',
    company: 'Berman and Rabin P.A.',
    period: 'Oct 2014 — Jun 2015',
    summary: 'Built and maintained custom C# applications and SQL, and handled workstation setup and IT support.',
  },
  {
    role: 'Night Shift Supervisor / Assistant System Administrator',
    company: 'McPherson County',
    period: 'Oct 2008 — Oct 2014',
    summary: 'Supervised night operations and assisted with system administration.',
  },
]

// `icon` options: github, email, twitch, youtube, instagram, tiktok, bluesky, linkedin
// Links with an empty `url` are hidden until you fill them in.
export const socials = [
  { label: 'GitHub', icon: 'github', url: 'https://github.com/dlevans' },
  { label: 'YouTube', icon: 'youtube', url: 'https://www.youtube.com/@JediHagrid' },
  { label: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/jedihagrid' },
  { label: 'TikTok', icon: 'tiktok', url: 'https://www.tiktok.com/@jedihagrid' },
  { label: 'Bluesky', icon: 'bluesky', url: 'https://bsky.app/profile/jedihagrid.bsky.social' },
].filter((s) => s.url)
