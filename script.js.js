const APP_ID = '1568439967856994';
const REDIRECT_URI = 'https://thevolksbank.github.io/facebookmeego.github.io/';
let userData = null;

// Initialize Facebook SDK
window.fbAsyncInit = function() {
  FB.init({
    appId: APP_ID,
    cookie: true,
    xfbml: true,
    version: 'v18.0'
  });

  // Enable login button
  const loginBtn = document.getElementById('fb-login-btn');
  loginBtn.disabled = false;
  loginBtn.innerHTML = '<span style="font-size: 20px;">f</span> Continue with Facebook';

  // Check if already logged in
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      loadUserData(response.authResponse.accessToken);
    }
  });
};

// Load Facebook SDK
(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Login with Facebook
function loginWithFacebook() {
  FB.login(function(response) {
    if (response.authResponse) {
      loadUserData(response.authResponse.accessToken);
    } else {
      alert('Login cancelled or failed. Please try again.');
    }
  }, {
    scope: 'public_profile,email,user_posts',
    return_scopes: true,
    auth_type: 'rerequest'
  });
}

// Load user data
function loadUserData(accessToken) {
  showLoading();

  FB.api('/me', {fields: 'id,name,email,picture.type(large)'}, function(response) {
    if (response && !response.error) {
      userData = response;
      userData.accessToken = accessToken;
      
      localStorage.setItem('fb_user_data', JSON.stringify(userData));
      localStorage.setItem('fb_login_time', Date.now());
      
      showApp();
      loadFeed();
    } else {
      alert('Failed to load user data: ' + (response.error ? response.error.message : 'Unknown error'));
      logout();
    }
  });
}

// Load feed
function loadFeed() {
  FB.api('/me/posts', {fields: 'message,created_time,story', limit: 10}, function(response) {
    if (response && response.data) {
      displayPosts(response.data);
    } else {
      displayDemoPosts();
    }
  });
}

// Display posts
function displayPosts(posts) {
  const container = document.getElementById('posts-container');
  container.innerHTML = '';
  
  if (posts.length === 0) {
    displayDemoPosts();
    return;
  }

  posts.forEach(post => {
    const postEl = document.createElement('div');
    postEl.className = 'post';
    
    const time = new Date(post.created_time).toLocaleDateString();
    
    postEl.innerHTML = `
      <div class="post-header">
        <img class="post-avatar" src="${userData.picture.data.url}" alt="${userData.name}">
        <div>
          <div class="post-author">${userData.name}</div>
          <div class="post-time">${time}</div>
        </div>
      </div>
      <div class="post-text">${post.message || post.story || 'No content'}</div>
      <div class="post-actions">
        <button>👍 Like</button>
        <button>💬 Comment</button>
        <button>↗️ Share</button>
      </div>
    `;
    
    container.appendChild(postEl);
  });
}

// Display demo posts
function displayDemoPosts() {
  const container = document.getElementById('posts-container');
  container.innerHTML = `
    <div class="post">
      <div class="post-header">
        <img class="post-avatar" src="${userData.picture.data.url}" alt="${userData.name}">
        <div>
          <div class="post-author">${userData.name}</div>
          <div class="post-time">Just now</div>
        </div>
      </div>
      <div class="post-text">🎉 Successfully logged in to Facebook via Nokia N9 web shell! This app is now connected to my real Facebook account using the official SDK.</div>
      <div class="post-actions">
        <button>👍 Like</button>
        <button>💬 Comment</button>
        <button>↗️ Share</button>
      </div>
    </div>
  `;
}

// Show screens
function showScreen(screen) {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === screen) {
      btn.classList.add('active');
    }
  });

  document.getElementById('feed-screen').classList.add('hidden');
  document.getElementById('profile-screen').classList.add('hidden');

  if (screen === 'feed') {
    document.getElementById('feed-screen').classList.remove('hidden');
    loadFeed();
  } else if (screen === 'profile') {
    showProfile();
  }
}

// Show profile
function showProfile() {
  document.getElementById('profile-screen').classList.remove('hidden');
  
  document.getElementById('profile-avatar').src = userData.picture.data.url;
  document.getElementById('profile-name').textContent = userData.name;
  document.getElementById('profile-email').textContent = userData.email || 'Email not available';
  
  document.getElementById('stat-posts').textContent = '127';
  document.getElementById('stat-friends').textContent = '483';
  document.getElementById('stat-photos').textContent = '256';
}

// Show app
function showApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('loading-screen').classList.add('hidden');
  document.getElementById('feed-screen').classList.remove('hidden');
  document.getElementById('native-tabbar').classList.remove('hidden');
  
  document.getElementById('user-info').classList.remove('hidden');
  document.getElementById('user-avatar').src = userData.picture.data.url;
  document.getElementById('user-name').textContent = userData.name;
}

// Show loading
function showLoading() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('loading-screen').classList.remove('hidden');
}

// Logout
function logout() {
  FB.logout(function(response) {
    localStorage.removeItem('fb_user_data');
    localStorage.removeItem('fb_login_time');
    
    userData = null;
    
    document.getElementById('feed-screen').classList.add('hidden');
    document.getElementById('profile-screen').classList.add('hidden');
    document.getElementById('native-tabbar').classList.add('hidden');
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
  });
}