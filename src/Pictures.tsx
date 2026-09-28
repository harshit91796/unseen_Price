// Shared static image manifest.
//
// The twelve shop photos that used to live here backed the invented
// "Trending Shops Near You" cards on the home feed. That section now lists real
// shops from the API, so the files were deleted — 808 KB out of every build.
//
// Only images that are actually rendered somewhere live here. The old sample
// product photography (womens/pants/sneakers/shirt/shoes/shorts/t-shirt/profile,
// ~450 files / 43 MB) was imported here but never rendered, so it shipped in the
// build for nothing. It has been removed.


// Video thumbnails — rendered by the YouTube videos page.
import video1 from './assets/images/thumbnail1.jpg';
import video2 from './assets/images/thumbnail2.jpg';
import video3 from './assets/images/thumbnail3.jpg';
import video4 from './assets/images/thumbnail4.jpg';


const videoImages = { video1, video2, video3, video4 };

export { videoImages };
