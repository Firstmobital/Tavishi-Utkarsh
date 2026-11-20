/**
 * ─────────────────────────────────────────────────────────────
 *  ALL invitation content lives here.
 *  Edit names, dates, venues, links and contacts in this file —
 *  no markup changes needed. Save, and the page re-renders.
 *
 *  Anything still marked PLACEHOLDER / XXXXXXXX needs filling in.
 *  Placeholder map links and WhatsApp numbers are hidden on the page
 *  automatically until you replace them.
 * ─────────────────────────────────────────────────────────────
 */

export const content = {
  /* ---------- Sharing / SEO ---------- */
  meta: {
    title: 'Tavishi & Utkarsh — Wedding Invitation',
    description:
      'With the blessings of our families, we invite you to celebrate the wedding of Tavishi & Utkarsh · 15 – 16 January 2027 · Jaipur.',
    // Full public URL of the site (used for the WhatsApp / social preview image).
    // On Vercel this is detected automatically from the production domain,
    // so you only need to set it if you use a custom domain AND the preview
    // image does not show. Example: 'https://tavishi-weds-utkarsh.com'
    siteUrl: '',
    ogImage: '/og-image.jpg',
    ogImageAlt: 'Tavishi & Utkarsh — 15 – 16 January 2027, Jaipur',
  },

  couple: {
    bride: 'Tavishi',
    groom: 'Utkarsh',
  },

  hashtag: '#TavUtkarsh',

  /* ---------- 1. Cover ---------- */
  hero: {
    preface: 'Together with their families',
    weds: 'weds',
    dateLine: '15 – 16 January 2027',
    city: 'Jaipur',
    scrollLabel: 'Scroll',
  },

  /* ---------- Music ---------- */
  music: {
    src: '/audio/music.mp3', // add the file to public/audio/music.mp3
    hint: 'Tap to play the music',
  },

  /* ---------- 2. Invitation ---------- */
  invitation: {
    invocation: '॥ श्री गणेशाय नमः ॥',
    blessing: ['With the blessings of the Almighty', 'and the love of our families,'],
    hosts: 'Smt. Asha & Shri Krishan Manohar Batwara',
    request: [
      'request the pleasure of your company',
      'to celebrate the wedding of their granddaughter',
    ],
    bride: {
      name: 'Tavishi',
      lines: ['D/o Smt. Aditi & Shri Yogendra Batwara'],
    },
    connector: 'with',
    groom: {
      name: 'Utkarsh',
      lines: [
        'Grandson of Smt. Pushpa & Late Shri Bhagwan Das Kotawala',
        'S/o Smt. Priti & Shri Ravi Kotawala',
      ],
    },
  },

  /* ---------- 3. Meet the couple ---------- */
  meetCouple: {
    eyebrow: 'Meet the',
    title: 'Bride & Groom',
    feature: {
      src: '/images/couple/couple-arch-800.webp',
      width: 800,
      height: 1201,
      alt: 'Tavishi and Utkarsh walking hand in hand beneath a lit palace archway',
    },
    names: 'Tavishi & Utkarsh',
    stripHint: 'Swipe · tap a photo to enlarge',
    photos: [
      {
        thumb: '/images/couple/couple-portrait-800.webp',
        full: '/images/couple/couple-portrait.webp',
        alt: 'Tavishi and Utkarsh laughing together, she in blush and he in ivory',
      },
      {
        thumb: '/images/couple/couple-dance-800.webp',
        full: '/images/couple/couple-dance.webp',
        alt: 'Tavishi and Utkarsh dancing on a floral stage',
      },
    ],
  },

  /* ---------- 4. Timeline ---------- */
  timeline: {
    eyebrow: 'Wedding Timeline',
    title: 'Mark Your Calendars',
    subtitle: "We can't wait to celebrate with you.",
    mapLabel: 'View Location',
    calendarLabel: 'Add to Calendar',
    // Shown between the first and second event
    kidsNote: { text: 'Sanskriti & Aditya eagerly await your presence!', afterEvent: 0 },
    events: [
      {
        id: 'reception',
        date: '15th January 2027',
        day: 'Friday',
        name: 'Wedding Reception',
        timings: [
          { label: 'Baraat Swagat', time: '8:00 PM' },
          { label: 'Dinner', time: '7:30 PM onwards' },
        ],
        venue: 'Raj Mahal Palace, Jaipur',
        map: 'https://www.google.com/maps/search/?api=1&query=Raj+Mahal+Palace+Jaipur',
        art: 'dome', // illustration: 'dome' | 'mandap' | 'lanterns'
        // Calendar entry (Asia/Kolkata local time)
        calendar: { start: '2027-01-15T19:30', end: '2027-01-15T23:59' },
      },
      {
        id: 'phere',
        date: '16th January 2027',
        day: 'Saturday',
        name: 'Phere',
        timings: [{ label: '', time: '10:00 AM onwards' }],
        venue: 'Rose Amer, Civil Lines, Jaipur',
        map: 'https://www.google.com/maps/search/?api=1&query=Rose+Amer+Civil+Lines+Jaipur',
        art: 'mandap',
        calendar: { start: '2027-01-16T10:00', end: '2027-01-16T14:00' },
      },
      {
        id: 'sufi-night',
        date: '16th January 2027',
        day: 'Saturday',
        name: 'Sufi Night',
        timings: [{ label: '', time: '8:00 PM onwards' }],
        venue: 'Kotawala Farm',
        map: 'MAP_LINK_PLACEHOLDER', // replace with a Google Maps link
        art: 'lanterns',
        calendar: { start: '2027-01-16T20:00', end: '2027-01-16T23:59' },
      },
    ],
  },

  /* ---------- 5. The setting (illustrated — no venue photos) ---------- */
  setting: {
    eyebrow: 'The Setting',
    title: 'A Night Garden at Raj Mahal',
    text: 'Bougainvillea, fairy lights and a garden under the stars. The rest is a surprise, waiting for you.',
  },

  /* ---------- 6. Family ---------- */
  family: {
    eyebrow: 'With Love & Best Compliments',
    title: 'Celebrating Their New Beginning',
    groups: [
      {
        title: 'Batwara Family',
        members: [
          'Shyam Manohar, Murli Manohar, Hari Manohar, Mahesh Manohar,',
          'Chandra Manohar, Ravi Manohar & Batwara Family',
        ],
      },
      {
        title: '',
        members: ['Seema & Yogesh Dangayach', 'Rinku & Ritesh Mamodiya'],
      },
      {
        title: 'Nanihal Paksh',
        members: [
          'Geeta Devi & B.L. Dangayach',
          'Arti & Rajkumar Dangayach',
          'Ritu & Sanjeev Dangayach',
        ],
      },
    ],
  },

  /* ---------- 7. RSVP ---------- */
  rsvp: {
    title: 'RSVP',
    subtitle: 'Kindly let us know you are coming',
    // Phone numbers in international format, e.g. '+919876543210'
    contacts: [
      { name: 'NAME_1', phone: '+91XXXXXXXXXX' },
      { name: 'NAME_2', phone: '+91XXXXXXXXXX' },
    ],
    // Number that receives WhatsApp RSVPs (international format).
    // The WhatsApp button stays hidden until this is a real number.
    whatsapp: '+91XXXXXXXXXX',
    whatsappLabel: 'RSVP on WhatsApp',
    whatsappMessage: "Hi! I'd love to join Tavishi & Utkarsh's wedding celebrations.",
  },

  /* ---------- 8. Countdown ---------- */
  countdown: {
    title: 'The Countdown Begins',
    text: 'Our families are delighted that you will be joining us in celebrating one of the happiest days of our lives.',
    target: '2027-01-15T19:30:00+05:30',
    done: 'The celebrations have begun!',
    labels: ['Days', 'Hours', 'Minutes', 'Seconds'],
  },

  /* ---------- 9. Closing ---------- */
  closing: {
    signoff: 'With love, the Batwara Family',
    line: 'We look forward to celebrating with you.',
  },

  footer: 'Tavishi & Utkarsh · January 2027',
};
