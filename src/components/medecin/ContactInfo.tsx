interface ContactInfoProps {
  type: 'phone' | 'email';
  value: string;
  label: string;
}

const ContactInfo = ({ type, value, label }: ContactInfoProps) => {
  const getIcon = () => {
    switch (type) {
      case 'phone':
        return (
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'phone':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'email':
        return 'bg-green-100 dark:bg-green-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  const handleClick = () => {
    if (type === 'phone') {
      window.location.href = `tel:${value}`;
    } else if (type === 'email') {
      window.location.href = `mailto:${value}`;
    }
  };

  return (
    <div 
      className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <div className={`p-2 ${getBgColor()} rounded-lg`}>
          {getIcon()}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">
          {value}
        </p>
      </div>
    </div>
  );
};

export default ContactInfo;
