// Apollo hero composition — programmatic injection.
//
// Every page calls inject() at boot. Idempotent: subsequent calls are
// no-ops. The CSS that drives the entrance animations and ambient
// effects lives in theme.css (cosmic sunburst, starfield, APOLLO
// wordmark with Mars cross-fade in the third letter slot).

// inject() — inserts the hero composition at the start of <body>.
//   - cosmic sunburst (warm amber halo, top-right)
//   - starfield (drifting twinkles)
//   - APOLLO wordmark with Mars cross-fade replacing the first O
// Visual behavior is byte-identical to the monolith: same letter
// stagger, same Mars timing, same opacities.
export function inject() {
  if (document.querySelector('.apollo-hero')) return; // already mounted

  const html =
    '<div class="cosmic-sunburst" aria-hidden="true">' +
      '<div class="sunburst-glow"></div>' +
    '</div>' +
    '<div class="starfield" aria-hidden="true"></div>' +
    '<div class="apollo-hero" aria-hidden="true">' +
      '<div class="wordmark-watermark">' +
        '<span class="letter">A</span>' +
        '<span class="letter">P</span>' +
        '<span class="letter mars-slot">' +
          '<span class="placeholder-o">O</span>' +
          '<img class="mars-image" src="/apollo/mars.png" alt="">' +
        '</span>' +
        '<span class="letter">L</span>' +
        '<span class="letter">L</span>' +
        '<span class="letter">O</span>' +
      '</div>' +
    '</div>';

  document.body.insertAdjacentHTML('afterbegin', html);
}
