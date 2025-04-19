
export const PaymentIcons: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-3 mb-4">
      <div className="text-xs text-gray-500 w-full text-center mb-2">Supported payment methods</div>
      <div className="flex flex-wrap justify-center gap-4">
        <img
          src="/assets/payment-icons/gpay-new.svg"
          alt="Google Pay"
          className="h-6 w-auto"
          loading="lazy"
        />
        <img
          src="/assets/payment-icons/paytm-new.svg"
          alt="Paytm"
          className="h-6 w-auto"
          loading="lazy"
        />
        <img
          src="/assets/payment-icons/bhim-new.svg"
          alt="BHIM UPI"
          className="h-6 w-auto"
          loading="lazy"
        />
        <img
          src="/assets/payment-icons/amazonpay-new.svg"
          alt="Amazon Pay"
          className="h-6 w-auto"
          loading="lazy"
        />
      </div>
    </div>
  );
};
