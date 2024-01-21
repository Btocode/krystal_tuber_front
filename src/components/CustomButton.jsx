import React from 'react'

const CustomButton = (text, classname, onclick) => {
  return (
    <div className='multi-button'>
      <button
        onClick={onclick}
        className={`
        ${classname}
    `}
      >
        {text}
      </button>
    </div>
  );
}

export default CustomButton