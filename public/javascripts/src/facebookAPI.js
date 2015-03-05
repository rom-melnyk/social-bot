/**
 * Created by obryl on 2/5/2015.
 */
FB.init({
    appId      : '808363195905708',
    cookie     : true,  // enable cookies to allow the server to access
    // the session
    version    : 'v2.1', // use version 2.1,
    channelUrl : "http://social-monitoring.herokuapp.com/"
});

// Load the SDK asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
