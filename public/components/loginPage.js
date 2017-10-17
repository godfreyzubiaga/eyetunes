function loginHtml() {
	return `
		<div id="content-container">
			<h1>Login</h1>
			<div id="field-container">
				<label class="labels" for="username">Username</label>
				<br>
				<input type="text" name="username" id="username" class="fields" required/>
				<br>
				<label class="labels" for="password">Passsword</label>
				<br>
				<input type="password" name="password" id="password" class="fields" required/>
				<br>
				<button type="submit" onclick="login(username.value, password.value)" id="submitBtn">Submit</button>
				<br>
				<span id="registerLink" onclick="changeContent('register')">Register here</span>
			</div>
		</div>
	`;
} 