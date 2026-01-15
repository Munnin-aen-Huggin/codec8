<script lang="ts">
	// Payment trust signals - Stripe security + payment methods
</script>

<div class="payment-trust">
	<!-- Secured by Stripe -->
	<div class="stripe-section">
		<svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
			<path d="M7 11V7a5 5 0 0110 0v4"/>
		</svg>
		<span class="secured-text">Secured by</span>
		<span class="stripe-text">stripe</span>
	</div>

	<div class="divider"></div>

	<!-- Payment Methods -->
	<div class="payment-methods">
		<span class="methods-label">We accept</span>
		<div class="method-icons">
			<!-- Visa -->
			<div class="payment-icon" title="Visa">
				<div class="card-badge visa">VISA</div>
			</div>

			<!-- Mastercard -->
			<div class="payment-icon" title="Mastercard">
				<div class="card-badge mastercard">
					<span class="mc-circles">
						<span class="mc-red"></span>
						<span class="mc-yellow"></span>
					</span>
				</div>
			</div>

			<!-- Amex -->
			<div class="payment-icon" title="American Express">
				<div class="card-badge amex">AMEX</div>
			</div>

			<!-- Apple Pay -->
			<div class="payment-icon" title="Apple Pay">
				<div class="card-badge apple-pay">
					<svg class="apple-logo" viewBox="0 0 170 170" fill="currentColor">
						<path d="M150.4 130.3c-2.4 5.5-5.2 10.6-8.4 15.2-4.4 6.3-8 10.6-10.7 13.1-4.3 4.1-8.9 6.2-13.8 6.3-3.5 0-7.8-1-12.8-3-5-2-9.6-3-13.8-3-4.4 0-9.1 1-14.2 3-5.1 2-9.2 3.1-12.4 3.2-4.7.2-9.4-2-14-6.5-2.9-2.7-6.6-7.3-11-13.8-4.7-7-8.6-15.1-11.7-24.4-3.3-10-5-19.7-5-29.1 0-10.8 2.3-20.1 7-27.8 3.7-6.2 8.6-11.1 14.7-14.6 6.1-3.6 12.7-5.4 19.8-5.5 3.7 0 8.6 1.2 14.7 3.4 6.1 2.3 10 3.4 11.7 3.4 1.3 0 5.6-1.3 12.9-4 6.9-2.5 12.7-3.5 17.5-3.1 12.9 1 22.6 6.1 29 15.2-11.6 7-17.3 16.8-17.2 29.4.1 9.8 3.7 18 10.6 24.5 3.2 3 6.7 5.3 10.6 6.9-.9 2.5-1.8 4.8-2.8 7.2zM119.1 7c0 7.7-2.8 14.9-8.4 21.5-6.7 7.9-14.9 12.4-23.7 11.7-.1-.9-.2-1.9-.2-2.9 0-7.4 3.2-15.3 8.9-21.8 2.9-3.3 6.5-6 10.9-8.2 4.4-2.2 8.5-3.4 12.4-3.6.1 1.1.1 2.2.1 3.3z"/>
					</svg>
					<span>Pay</span>
				</div>
			</div>

			<!-- Google Pay -->
			<div class="payment-icon" title="Google Pay">
				<div class="card-badge google-pay">G Pay</div>
			</div>
		</div>
	</div>
</div>

<style>
	.payment-trust {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		margin-top: 32px;
		padding: 16px 24px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 12px;
	}

	.stripe-section {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.lock-icon {
		width: 16px;
		height: 16px;
		color: #10b981;
		flex-shrink: 0;
	}

	.secured-text {
		font-size: 0.85rem;
		color: #a1a1a6;
		font-weight: 500;
	}

	.stripe-text {
		font-size: 1.1rem;
		font-weight: 700;
		color: #635BFF;
		letter-spacing: -0.02em;
	}

	.divider {
		width: 1px;
		height: 24px;
		background: rgba(255, 255, 255, 0.1);
	}

	.payment-methods {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.methods-label {
		font-size: 0.8rem;
		color: #6b6b70;
		font-weight: 500;
	}

	.method-icons {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.payment-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s;
	}

	.payment-icon:hover {
		transform: translateY(-2px);
	}

	.card-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		height: 28px;
		padding: 0 10px;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-align: center;
		line-height: 1;
	}

	.card-badge.visa {
		background: #1a1f71;
		color: #fff;
		font-style: italic;
	}

	.card-badge.mastercard {
		background: #000;
		padding: 0 6px;
	}

	.mc-circles {
		display: flex;
		align-items: center;
	}

	.mc-red {
		width: 14px;
		height: 14px;
		background: #eb001b;
		border-radius: 50%;
	}

	.mc-yellow {
		width: 14px;
		height: 14px;
		background: #f79e1b;
		border-radius: 50%;
		margin-left: -5px;
	}

	.card-badge.amex {
		background: #006fcf;
		color: #fff;
	}

	.card-badge.apple-pay {
		background: #000;
		color: #fff;
		gap: 3px;
	}

	.apple-logo {
		width: 10px;
		height: 12px;
		flex-shrink: 0;
	}

	.card-badge.google-pay {
		background: #fff;
		color: #5f6368;
		border: 1px solid #dadce0;
	}

	@media (max-width: 700px) {
		.payment-trust {
			flex-direction: column;
			gap: 12px;
			padding: 14px 16px;
		}

		.divider {
			width: 80%;
			height: 1px;
		}

		.stripe-section {
			justify-content: center;
		}

		.payment-methods {
			flex-direction: column;
			gap: 8px;
			align-items: center;
		}

		.method-icons {
			gap: 8px;
			flex-wrap: wrap;
			justify-content: center;
		}

		.card-badge {
			min-width: 40px;
			height: 26px;
			font-size: 0.7rem;
		}
	}
</style>
