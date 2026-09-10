// Shared static image manifest.
//
// Only images that are actually rendered somewhere live here. The old sample
// product photography (womens/pants/sneakers/shirt/shoes/shorts/t-shirt/profile,
// ~450 files / 43 MB) was imported here but never rendered, so it shipped in the
// build for nothing. It has been removed.

// Shop photos — rendered by the "Trending Shops" section on the home feed.
import shop1 from './assets/images/shopes/shop1.jpg';
import shop2 from './assets/images/shopes/shop2.jpeg';
import shop3 from './assets/images/shopes/shop3.jpeg';
import shop4 from './assets/images/shopes/shop4.jpeg';
import shop5 from './assets/images/shopes/shop5.jpeg';
import shop6 from './assets/images/shopes/shop6.jpeg';
import shop7 from './assets/images/shopes/shop7.jpeg';
import shop8 from './assets/images/shopes/shop8.jpeg';
import shop9 from './assets/images/shopes/shop9.jpeg';
import shop10 from './assets/images/shopes/shop10.jpeg';
import shop11 from './assets/images/shopes/shop11.jpeg';
import shop12 from './assets/images/shopes/shop12.jpg';

// Video thumbnails — rendered by the YouTube videos page.
import video1 from './assets/images/thumbnail1.jpg';
import video2 from './assets/images/thumbnail2.jpg';
import video3 from './assets/images/thumbnail3.jpg';
import video4 from './assets/images/thumbnail4.jpg';

const shopeImages = { shop1, shop2, shop3, shop4, shop5, shop6, shop7, shop8, shop9, shop10, shop11, shop12 };

const videoImages = { video1, video2, video3, video4 };

export { shopeImages, videoImages };
