"use client";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      desc: "Perfect for beginners",
      features: [
        "5 AI Scripts / month",
        "Basic Avatar",
        "720p Video",
        "Limited Templates",
      ],
      btn: "Start Free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "₹499/mo",
      desc: "Best for creators 🚀",
      features: [
        "Unlimited Scripts",
        "Premium Avatars",
        "1080p Video",
        "All Templates",
        "Faster Generation",
      ],
      btn: "Upgrade Now",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For teams & businesses",
      features: [
        "Team Access",
        "API Integration",
        "Custom Avatars",
        "Priority Support",
      ],
      btn: "Contact Us",
      highlight: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F] py-16 "
    >
      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-12 ">
          <h2 className="text-4xl font-bold text-white mb-4">
            💰 Pricing Plans
          </h2>
          <p className="text-gray-400">
            Choose the plan that fits your needs
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 ">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl border ${
                plan.highlight
                  ? "border-purple-500 scale-105"
                  : "border-gray-700"
              } bg-gray- shadow-lg`}
            >
              <h3 className="text-2xl font-semibold text-white mb-2">
                {plan.name}
              </h3>

              <p className="text-gray-400 mb-4">{plan.desc}</p>

              <h4 className="text-3xl font-bold text-white mb-6 ">
                {plan.price}
              </h4>

              <ul className="space-y-3 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-gray-300">
                    ✔ {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold ${
                  plan.highlight
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {plan.btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}