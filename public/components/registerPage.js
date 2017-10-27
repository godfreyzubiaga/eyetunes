function registerHtml() {
  return `
    <div id="content-container">
      <h1>Register</h1>
      <div id="field-container">
        <label class="labels" for="fullname">Full Name / Band Name</label>
        <input type="text" name="name" id="fullname" class="fields"/>
        <label class="labels" for="username">Username</label>
        <p class="subLabel">(6 or more characters)</p>        
        <input type="text" name="username" id="username" class="fields" onkeyup="checkIfAvailable(username.value)"/>
        <label class="labels" for="password" >Passsword</label>
        <p class="subLabel">(6 or more characters)</p>
        <input type="password" name="password" id="password" class="fields" onkeyup="passwordCheck(password.value)">
        <div id="options">
          <input type="radio" name="role" id="artist" value="artist">
          <label for="artist">Artist</label>
          <input type="radio" name="role" id="user" checked value="user">
          <label for="user">User</label>
        </div>
        <button type="submit" id="submitBtn" onclick="register(fullname.value, username.value, password.value)">Submit</button>
        <br>
        <span id="loginLink" onclick="changeContent('login')">Login here</span>
      </div>
    </div>
  `;
}
