function paySubscriptionPage() {
	return `
		<p id="logout" class="links" onclick="logout()">Logout</p>		
		<div id="main-content">
			<div id="sub-container">
				<h1>Pay Subscription</h1>
				<div id="options">
					<span onclick="changePrice('monthly')">
						<input type="radio" name="subscriptionType" value="monthly" checked id="monthly">
						<label for="monthly">Monthly</label>
					</span>
					<span onclick="changePrice('yearly')">
						<input type="radio" name="subscriptionType" value="yearly" id="yearly">
						<label for="yearly">Yearly</label>
					</span>
					<span onclick="changePrice('oneTime')">
						<input type="radio" name="subscriptionType" value="oneTime" id="oneTime">
						<label for="oneTime">One Time Payment</label>
					</span>
				</div>
				<div>
					<h3>
						Price(&#8369;):
						<span id="price"></span>
					</h3>
				</div>
				<div id="payment-method">
					<span>
						<input type="radio" name="payment-method-type" checked id="e-load">
						<label for="e-load">E-Load</label>
					</span>
				</div>
				<div id="payment-method-container">
					<h3>
						<label for="phone-number-field">Phone Number: (+639)</label>
						<input type="tel" id="phoneNumberField" minlength="9" maxlength="9" class="fields">
					</h3>
				</div>
				<button class="btn" onclick="pay(phoneNumberField.value)">Pay</button>
			</div>
		</div>
	`;
}