// Click handler to change background color
$(document).ready(function() {
  // List of named HTML colors
  var namedColors = [
    'blue', 'red', 'green', 'yellow', 'orange', 'purple', 'pink', 
    'cyan', 'magenta', 'lime', 'navy', 'teal', 'maroon', 'olive',
    'coral', 'indigo', 'violet', 'turquoise', 'crimson', 'gold'
  ];
  
  // Function to change background to random named color
  function changeBackgroundColor() {
    var randomColor = namedColors[Math.floor(Math.random() * namedColors.length)];
    $('body').css('background-color', randomColor);
    console.log('Background changed to:', randomColor); // Debug log
  }
  
  // Handle click/tap anywhere on the site
  $(document).on('click', function() {
    changeBackgroundColor();
  });
  
  // DVD screensaver bouncing animation
  var $container = $('.container');
  
  // Wait a moment for container to render, then get dimensions
  setTimeout(function() {
    // Get container dimensions
    var containerWidth = $container.outerWidth();
    var containerHeight = $container.outerHeight();
    
    // Initial position (random starting point)
    var x = Math.random() * (window.innerWidth - containerWidth);
    var y = Math.random() * (window.innerHeight - containerHeight);
    
    // Velocity (speed and direction) - random diagonal direction
    var velocityX = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2); // 1-3 pixels per frame
    var velocityY = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2);
    
    // Animation function
    function animate() {
      // Get current window dimensions
      var maxX = window.innerWidth - containerWidth;
      var maxY = window.innerHeight - containerHeight;
      
      // Update position
      x += velocityX;
      y += velocityY;
      
      // Bounce off horizontal edges - reverse velocity when we hit
      if (x <= 0 || x >= maxX) {
        velocityX = -velocityX;
        x = Math.max(0, Math.min(x, maxX)); // Clamp to bounds
      }
      
      // Bounce off vertical edges - reverse velocity when we hit
      if (y <= 0 || y >= maxY) {
        velocityY = -velocityY;
        y = Math.max(0, Math.min(y, maxY)); // Clamp to bounds
      }
      
      // Apply position using transform for smoother rendering (GPU accelerated)
      // Round values to avoid subpixel rendering issues
      $container.css({
        'transform': 'translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)'
      });
      
      // Continue animation
      requestAnimationFrame(animate);
    }
    
    // Handle window resize
    $(window).on('resize', function() {
      // Recalculate container dimensions
      containerWidth = $container.outerWidth();
      containerHeight = $container.outerHeight();
      // Recalculate bounds and adjust position if needed
      var maxX = window.innerWidth - containerWidth;
      var maxY = window.innerHeight - containerHeight;
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));
    });
    
    // Start animation
    animate();
  }, 100);
});

// $(document).on('scroll', function() {
//   var pixelsFromTop = $(document).scrollTop();
//
//   var documentHeight = $(document).height()
//   var windowHeight = $(window).height()
//
//   var difference = documentHeight - windowHeight
//
//   var percentage = 100 * pixelsFromTop / difference
//
//   $('.progress-bar').css('width', percentage + 'vw')
//
//
// })

// progress bars

$(document).on("scroll", function () {
  // total bar dist
  var barTotal = ($(window).height() * 2) + ($(window).width() * 2)

  // scroll total
  var scrollTotal = $(document).height() - $(window).height()

  // current scroll position
  var pixels = $(document).scrollTop()

  // percantage scrolled
  var pc = pixels / scrollTotal

  // bar across percentage of total
  var barAcross = $(window).width() / barTotal

  // bar down percentage of total
  var barDown = $(window).height() / barTotal

  var bar1 = pc / barAcross
  var bar2 = (pc - barAcross) / barDown
  var bar3 = (pc - barAcross - barDown) / barAcross
  var bar4 = (pc - barAcross - barDown - barAcross) / barDown

  $("div.bar-1").css("width",  100 * bar1 + "%")
  $("div.bar-2").css("height", 100 * bar2 + "%")
  $("div.bar-3").css("width",  100 * bar3 + "%")
  $("div.bar-4").css("height", 100 * bar4 + "%")

  console.log(bar1)
})

// open linkedin in

$('.linkedin').on('click', function() {

  $('#whyyy').css('display', 'flex')
  $('body').css('overflow', 'hidden') // lock scrolling

  return false

})

// close linkedin

$('#whyyy').on('click', function() {

  $('#whyyy').css('display', 'none')
  $('body').css('overflow', 'initial') // reset scrolling

  return false

})



// open preview

$('.preview').on('click', function() {

  $('.preview-open').fadeIn(300)
  $('body').css('overflow', 'hidden') // lock scrolling

  return false

})

// close preview

$('.preview-open').on('click', function() {

  $('.preview-open').fadeOut(150)
  $('body').css('overflow', 'initial') // reset scrolling

  return false

})

// smooth scroll

$(".hire-left").click(function() {
    $('html, body').animate({
        scrollTop: $("#hire").offset().top
    }, 2000);
    return false

});

$(".hire-right").click(function() {
    $('html, body').animate({
        scrollTop: $("#hire").offset().top
    }, 2000);
    return false

});

$(".backtotop").click(function() {
  $("html, body").animate({ scrollTop: 0 }, 1600, "swing");
  return false;
});
