<script lang="ts">
	// Payment method icons for trust signals
</script>

<div class="payment-badges">
	<span class="secured-text">Secured by</span>

	<!-- Stripe Badge -->
	<div class="stripe-badge">
		<svg viewBox="0 0 60 25" fill="currentColor">
			<path d="M5 10.2c0-.7.6-1 1.5-1 1.4 0 3.1.4 4.5 1.1V6.6c-1.5-.6-3-.8-4.5-.8C3.4 5.8 1 7.5 1 10.5c0 4.7 6.4 3.9 6.4 6 0 .8-.7 1.1-1.7 1.1-1.5 0-3.4-.6-4.9-1.4v3.6c1.7.7 3.3 1 4.9 1 3.2 0 5.4-1.6 5.4-4.6-.1-5-6.5-4.1-6.1-6.2z"/>
			<path d="M14.3 6l-2.4.5v11.7l2.4.5V6zm0-2.4l-2.4.5V6l2.4-.5V3.6z"/>
			<path d="M17 12c0-1.2.6-1.7 1.4-1.7.6 0 1.2.2 1.9.7l.5-1.9c-.7-.5-1.7-.9-2.7-.9-2.6 0-4.4 1.8-4.4 4.8 0 3.4 2.4 4.8 4.4 4.8 1 0 1.9-.2 2.5-.7l-.4-1.9c-.5.3-1 .5-1.6.5-.9.1-1.6-.4-1.6-2.7z"/>
			<path d="M26.6 8.2c-1 0-1.7.5-2.1 1.3l-.1-1h-2.3v10.2h2.6v-7c.5-.6 1.2-.9 2-.7V8.4c-.1-.2-.1-.2-.1-.2z"/>
			<path d="M30.3 5.8c-.8 0-1.5.5-1.8 1.1l-.1-.9h-2.3v11.7h2.6v-9c.4-.6 1-1 1.7-1 .6 0 1 .3 1 1.1v8.9h2.6V8.4c0-1.7-1-2.6-2.4-2.6-.5 0-1 .1-1.3 0z"/>
			<path d="M38.8 5.8c-2.7 0-4.4 2.2-4.4 4.7 0 3.3 2.2 4.9 4.9 4.9 1.4 0 2.5-.3 3.4-.9v-2.2c-.8.5-1.8.8-2.9.8-1.2 0-2.3-.5-2.4-1.7h6c0-.2.1-.9.1-1.4 0-2.7-1.4-4.2-4.7-4.2zm-1.4 3.7c0-1.1.7-1.7 1.4-1.7.7 0 1.4.5 1.4 1.7h-2.8z"/>
		</svg>
	</div>

	<div class="divider"></div>

	<!-- Payment Methods -->
	<div class="payment-methods">
		<!-- Visa -->
		<div class="payment-icon" title="Visa">
			<svg viewBox="0 0 38 24" fill="none">
				<rect x="0.5" y="0.5" width="37" height="23" rx="3.5" fill="#fff" stroke="#D9D9D9"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M16.3 16.8h-2l1.4-8.5h2l-1.4 8.5z" fill="#00579F"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M24.5 8.5c-.4-.2-1-.3-1.8-.3-2 0-3.4 1-3.4 2.5 0 1.1 1 1.7 1.8 2 .8.4 1.1.7 1.1 1 0 .6-.7.8-1.3.8-.9 0-1.3-.1-2-.4l-.3-.1-.3 1.8c.5.2 1.4.4 2.4.4 2.1 0 3.5-1 3.5-2.6 0-.9-.5-1.5-1.7-2.1-.7-.4-1.1-.6-1.1-1 0-.3.4-.7 1.1-.7.7 0 1.1.1 1.5.3l.2.1.3-1.7z" fill="#00579F"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M28 8.3h-1.6c-.5 0-.9.1-1.1.6l-3.1 7.9h2.1l.4-1.2h2.6l.2 1.2h1.9l-1.4-8.5zm-2.5 5.5l.8-2.3c0 .1.2-.5.3-.8l.1.7.5 2.4h-1.7z" fill="#00579F"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M12.2 8.3L10.1 14l-.2-1.1c-.4-1.3-1.6-2.8-2.9-3.5l1.8 7.3h2.2l3.2-8.4h-2z" fill="#00579F"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M8.1 8.3H4.7l-.1.2c2.6.6 4.3 2.2 5 4l-.7-3.6c-.1-.5-.5-.6-.8-.6z" fill="#FAA61A"/>
			</svg>
		</div>

		<!-- Mastercard -->
		<div class="payment-icon" title="Mastercard">
			<svg viewBox="0 0 38 24" fill="none">
				<rect x="0.5" y="0.5" width="37" height="23" rx="3.5" fill="#fff" stroke="#D9D9D9"/>
				<path d="M15.2 19.2h7.6V4.8h-7.6v14.4z" fill="#FF5F00"/>
				<path d="M15.7 12c0-2.9 1.4-5.5 3.5-7.2a9.2 9.2 0 100 14.4c-2.1-1.7-3.5-4.3-3.5-7.2z" fill="#EB001B"/>
				<path d="M34.1 12a9.2 9.2 0 01-14.9 7.2c2.1-1.7 3.5-4.3 3.5-7.2s-1.4-5.5-3.5-7.2a9.2 9.2 0 0114.9 7.2z" fill="#F79E1B"/>
			</svg>
		</div>

		<!-- Amex -->
		<div class="payment-icon" title="American Express">
			<svg viewBox="0 0 38 24" fill="none">
				<rect x="0.5" y="0.5" width="37" height="23" rx="3.5" fill="#006FCF" stroke="#006FCF"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 12.4L5.1 15.2h1.7l.3-.6h.7l.3.6h1.8v-.5l.2.5h1l.2-.5v.5h4l.5-.5.5.5h4.1l-1.4-1.4 1.4-1.4h-4l-.5.5-.5-.5h-4.4v.4l-.2-.4h-1.2l-.2.4v-.4H7.1l-.3.6-.3-.6zm.6.4h.8l.9 2h-.7l-.2-.4H7l-.2.4h-.7l.9-2zm.5.4l-.2.5h.5l-.3-.5zm3.7-.4h1.2l.7.8.7-.8h1l-1.2 1.2 1.2 1.2h-1.1l-.7-.8-.6.8h-1.2v-2.4zm.6.4v.4h1l-.5-.4h-.5zm0 .7v.5h1.2v-.5h-1.2zm5.5-.7v2h.6v-.7h.5l.5.7h.7l-.6-.8c.3-.1.5-.4.5-.7 0-.5-.4-.7-.9-.7h-1.3zm.6.4h.6c.2 0 .3.1.3.3 0 .2-.1.3-.3.3h-.6v-.6z" fill="#fff"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M19.9 8.8l-1.4 1.4h4l.5-.5.5.5h4.3v-.4l.2.4h1.1l.2-.4v.4h1.9l.5-.5.5.5h1.7L32.4 9l1.4-1.4h-1.7l-.5.5-.5-.5H27v.4l-.2-.4h-1l-.2.4v-.4H24l-.3.6-.3-.6H22l.5.6h.8l.9 2.1h-.8l-.2-.5h-.8l-.2.5h-.7l.9-2.1h-1.5zm.6.5h.8l.9 2h-.7l-.2-.4h-.8l-.2.4H19l.9-2h.6zm.5.4l-.2.6h.5l-.3-.6z" fill="#fff"/>
			</svg>
		</div>

		<!-- Apple Pay -->
		<div class="payment-icon" title="Apple Pay">
			<svg viewBox="0 0 38 24" fill="none">
				<rect x="0.5" y="0.5" width="37" height="23" rx="3.5" fill="#000" stroke="#000"/>
				<path d="M13 9.4c-.4.5-.9.8-1.5.8-.1-.6.2-1.2.5-1.6.4-.5 1-.8 1.5-.8.1.6-.1 1.2-.5 1.6zm.5.8c-.8 0-1.6.5-2 .5-.4 0-1.1-.5-1.8-.5-.9 0-1.8.5-2.3 1.4-1 1.7-.3 4.2.7 5.6.5.7 1 1.4 1.8 1.4.7 0 1-.5 1.8-.5.8 0 1.1.5 1.8.5.8 0 1.2-.7 1.7-1.4.5-.8.8-1.5.8-1.5 0 0-1.4-.5-1.5-2.1 0-1.3 1.1-2 1.1-2-.6-.9-1.5-1-1.9-1h-.2z" fill="#fff"/>
				<path d="M20.4 8.1c1.4 0 2.4 1 2.4 2.3 0 1.4-1 2.4-2.5 2.4h-1.6v2.5h-1.2V8.1h2.9zm-1.7 3.7h1.3c1 0 1.5-.5 1.5-1.4 0-.9-.5-1.4-1.5-1.4h-1.3v2.8z" fill="#fff"/>
				<path d="M23.4 13.5c0-1.1.9-1.8 2.4-1.9l1.8-.1v-.5c0-.7-.5-1.1-1.3-1.1-.7 0-1.2.3-1.3.9h-1.1c.1-1.1 1-1.9 2.5-1.9s2.3.8 2.3 2v4.2h-1.1v-1h0c-.3.7-1 1.1-1.9 1.1-1.2.1-2.3-.7-2.3-1.7zm4.2-.5v-.5l-1.6.1c-.8.1-1.3.4-1.3.9 0 .6.5.9 1.2.9.9 0 1.7-.6 1.7-1.4z" fill="#fff"/>
				<path d="M30 17.1v-.9c.1 0 .3 0 .4 0 .5 0 .8-.2 1-.8l.1-.3-2.1-5.9h1.2l1.5 4.8 1.5-4.8h1.2l-2.2 6.2c-.5 1.4-1 1.8-2.2 1.8-.1 0-.3 0-.4-.1z" fill="#fff"/>
			</svg>
		</div>

		<!-- Google Pay -->
		<div class="payment-icon" title="Google Pay">
			<svg viewBox="0 0 38 24" fill="none">
				<rect x="0.5" y="0.5" width="37" height="23" rx="3.5" fill="#fff" stroke="#D9D9D9"/>
				<path d="M18.3 12v3.1h-1V8h2.6c.6 0 1.2.2 1.7.6.5.4.7 1 .7 1.6 0 .7-.2 1.2-.7 1.6-.5.4-1 .6-1.7.6h-1.6zm0-3.1v2.2h1.6c.4 0 .7-.1.9-.4.3-.2.4-.5.4-.7 0-.3-.1-.5-.4-.7-.2-.3-.5-.4-.9-.4h-1.6z" fill="#5F6368"/>
				<path d="M25.3 10.2c.7 0 1.3.2 1.7.6.4.4.6 1 .6 1.7v3.6h-1v-.8c-.3.6-.9 1-1.7 1-.6 0-1.1-.2-1.5-.5-.4-.4-.6-.8-.6-1.3 0-.5.2-.9.6-1.3.4-.3.9-.5 1.5-.5.6 0 1.1.2 1.4.5v-.7c0-.4-.1-.7-.4-.9-.2-.2-.6-.4-1-.4-.6 0-1.1.3-1.3.8l-.9-.4c.4-.8 1.1-1.4 2.6-1.4zm-1.2 4.7c0 .3.1.5.3.6.2.2.5.3.8.3.4 0 .8-.2 1.1-.5.3-.3.4-.7.4-1.1-.3-.3-.7-.5-1.3-.5-.4 0-.7.1-1 .4-.2.2-.3.5-.3.8z" fill="#5F6368"/>
				<path d="M32.9 10.4l-3.1 7.2h-1l1.1-2.5-2-4.7h1.1l1.4 3.5 1.4-3.5h1.1z" fill="#5F6368"/>
				<path d="M13.3 11.7c0-.3 0-.6-.1-.9h-4v1.7h2.3c-.1.5-.4 1-.8 1.3v1h1.3c.8-.7 1.3-1.8 1.3-3.1z" fill="#4285F4"/>
				<path d="M9.2 15c1.1 0 2-.4 2.7-1l-1.3-1c-.4.3-.8.4-1.4.4-.6 0-1.2-.2-1.6-.5-.5-.4-.8-.9-.9-1.5H5.4v1.1c.7 1.5 2.1 2.5 3.8 2.5z" fill="#34A853"/>
				<path d="M6.7 11.4c-.1-.3-.2-.6-.2-.9 0-.3.1-.6.2-.9V8.5H5.4c-.3.6-.4 1.3-.4 2s.2 1.4.4 2l1.3-1.1z" fill="#FBBC04"/>
				<path d="M9.2 8c.6 0 1.2.2 1.6.6l1.2-1.2c-.7-.7-1.7-1.1-2.8-1.1-1.7 0-3.1 1-3.8 2.5l1.3 1.1c.3-1 1.3-1.9 2.5-1.9z" fill="#EA4335"/>
			</svg>
		</div>
	</div>
</div>

<style>
	.payment-badges {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin-top: 24px;
		padding: 12px 20px;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 8px;
		opacity: 0.7;
		transition: opacity 0.3s;
	}

	.payment-badges:hover {
		opacity: 1;
	}

	.secured-text {
		font-size: 0.8rem;
		color: #6b6b70;
		font-weight: 500;
	}

	.stripe-badge {
		display: flex;
		align-items: center;
	}

	.stripe-badge svg {
		width: 50px;
		height: 22px;
		color: #635BFF;
	}

	.divider {
		width: 1px;
		height: 20px;
		background: #3a3a3c;
	}

	.payment-methods {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.payment-icon {
		display: flex;
		align-items: center;
	}

	.payment-icon svg {
		width: 36px;
		height: 24px;
		border-radius: 4px;
	}

	@media (max-width: 600px) {
		.payment-badges {
			flex-wrap: wrap;
			gap: 8px;
		}

		.payment-icon svg {
			width: 32px;
			height: 20px;
		}

		.stripe-badge svg {
			width: 40px;
			height: 18px;
		}
	}
</style>
