const Rating = ({ initialRating = 0, onRate }) => {
  const handleRating = (value) => {
    if (onRate) onRate(value)
  }

  return (
    <div>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1
        return (
          <span
            key={index}
            className={`text-xl sm:text-2xl cursor-pointer transition-colors ${starValue <= initialRating ? 'text-yellow-500' : 'text-gray-400'}`}
            onClick={() => handleRating(starValue)}
          >
            &#9733;
          </span>
        )
      })}
    </div>
  )
}

export default Rating