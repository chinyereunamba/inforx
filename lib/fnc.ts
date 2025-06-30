const handleContactEmail = () => {
  const subject = encodeURIComponent(
    "Partnership Inquiry - InfoRx Healthcare Platform"
  );
  const body = encodeURIComponent(`Hello InfoRx Team,

I'm interested in learning more about InfoRx and potential collaboration opportunities.

Please provide more information about:
- Partnership opportunities
- Product demonstrations
- Implementation in our organization

Best regards,
`);

  window.location.href = `mailto:hello@info-rx.org?subject=${subject}&body=${body}`;
};

export { handleContactEmail };
