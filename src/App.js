import React, { useState } from 'react';
import { FaPaste, FaSpinner } from 'react-icons/fa';
import { IoIosDownload } from 'react-icons/io';

const App = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [downloadOptions, setDownloadOptions] = useState([]);
  const [loading , setLoading] = useState(false);

  const fetchOptions = async () => {
    setDownloadOptions(null);
    if (!videoUrl) {
      alert('Please enter a YouTube video URL');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://audiotuber.vercel.app/suggest_formats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error(`Error: ${response.statusText}`);
      }

      console.log(response);

      const data = await response.json();
      setDownloadOptions(data.formats);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handleDownload = async (quality) => {
    try {
      setLoading(true);

      const response = await fetch('https://audiotuber.vercel.app/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl, quality }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Parse the filename from the 'Content-Disposition' header
      const contentDispositionHeader = response.headers.get('Content-Disposition');
      console.log(contentDispositionHeader);
      const filename = contentDispositionHeader
        ? contentDispositionHeader.match(/filename="(.+)"/)[1]
        : 'krystalDownloader_' + Date.now();

      // Create a Blob from the response data
      const blob = await response.blob();

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;

      // Append the link to the body and trigger the click event
      document.body.appendChild(link);
      link.click();

      // Remove the link element from the DOM
      document.body.removeChild(link);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex items-center mb-4">
        <FaPaste size={24} className="mr-2" />
        <input
          type="text"
          placeholder="Paste YouTube video URL..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="border p-2 rounded focus:outline-none w-64"
        />
      </div>

      <button
        onClick={fetchOptions}
        className="bg-blue-500 text-white py-2 px-4 rounded focus:outline-none"
      >
        <IoIosDownload size={20} className="mr-2" />
        Download
      </button>

      {
        loading && <div className="mt-4">
          <FaSpinner className="animate-spin" />
        </div>
      }
      {downloadOptions && (
        <div className="mt-4">
          {Object.entries(downloadOptions).map(([type, options]) => (
            <div key={type} className="flex flex-wrap space-x-2">
              <span className="font-bold">{type.charAt(0).toUpperCase() + type.slice(1)}:</span>
              {options.map((option, index) => (
                <button
                  key={index}
                  className="bg-blue-500 text-white py-2 px-4 rounded focus:outline-none mb-2"
                  onClick={() => handleDownload(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
