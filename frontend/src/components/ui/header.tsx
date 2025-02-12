const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-end space-x-2 max-w-6xl px-6 py-3">
        <img
          src="/icons/speedometer.svg"
          alt="Speedometer"
          className="w-8 h-8"
        />
        <span className="text-lg text-black font-bold font-squada">Speedo</span>
      </div>
    </header>
  );
};

export default Header;
