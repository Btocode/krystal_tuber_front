import React, { useEffect, useState } from 'react';
import { FaAndroid } from 'react-icons/fa';
import classNames from "classnames";
import toast, { Toaster } from "react-hot-toast";
import { MdOutlineClose } from "react-icons/md";
import { HiLightningBolt } from "react-icons/hi";
import styles from "./App.module.css";


const notify = (title, description) =>
  toast.custom(
    (t) => (
      <div
        className={classNames([
          styles.notificationWrapper,
          t.visible ? "right-0" : "-right-96",
        ])}
      >
        <div className={styles.iconWrapper}>
          <HiLightningBolt />
        </div>
        <div className={styles.contentWrapper}>
          <h1>{title}</h1>
          <p>
            {
              description
            }
          </p>
        </div>
        <div className={styles.closeIcon} onClick={() => toast.dismiss(t.id)}>
          <MdOutlineClose />
        </div>
      </div>
    ),
    { id: "unique-notification", position: "top-right" }
  );



const App = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [downloadOptions, setDownloadOptions] = useState([]);
  const [downloadInfo, setDownloadInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [country, setCountry] = useState(null);

  useEffect(() => {
    if(country === null){
      fetch("https://audiotuber.vercel.app/get_location")
        .then((response) => response.json())
        .then((data) => {
          const country = data.country;
          setCountry(country);
          console.log("User country:", country);
        })
        .catch((error) => {
          console.error("Error fetching location:", error);
        });
    }
  }, []); 

  const fetchOptions = async () => {
    setDownloadOptions(null);
    setSelectedFormat(null);
    if (!videoUrl || !validateUrl(videoUrl)) {
      notify(
        "Invalid URL",
        "Please make sure you have pasted a valid YouTube video URL."
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "https://audiotuber.vercel.app/suggest_formats",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: videoUrl }),
        }
      );

      if (!response.ok) {
        setLoading(false);
        throw new Error(`Error: ${response.statusText}`);
      }

      console.log(response);

      const data = await response.json();
      setDownloadOptions(data.formats);
      setDownloadInfo(data.info);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handleDownload = async (quality) => {
    try {
      setLoading(true);

      const response = await fetch("https://audiotuber.vercel.app/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: videoUrl, quality }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Parse the filename from the 'Content-Disposition' header
      const contentDispositionHeader = response.headers.get(
        "Content-Disposition"
      );
      console.log(contentDispositionHeader);
      const filename = contentDispositionHeader
        ? contentDispositionHeader.match(/filename="(.+)"/)[1]
        : "krystalDownloader_" + Date.now();

      // Create a Blob from the response data
      const blob = await response.blob();

      // Create a link element to trigger the download
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;

      // Append the link to the body and trigger the click event
      document.body.appendChild(link);
      link.click();

      // Remove the link element from the DOM
      document.body.removeChild(link);

      setLoading(false);
      setDownloadInfo({});
      setDownloadOptions(null);
      setSelectedFormat(null);
      setVideoUrl("");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const validateUrl = (url) => {
    const pattern = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    return pattern.test(url);
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      if (validateUrl(text)) {
        setVideoUrl(text);
      } else {
        notify(
          "Invalid URL",
          "Please make sure you have copied a valid YouTube video URL."
        );
      }
    });
  };

  return (
    <main className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <div className="container flex flex-col items-center xl:min-h-screen lg:min-h-screen md:min-h-screen bg-gray-100 relative gap-10">
        <div className="w-full sticky top-0 h-16 bg-gray-100 z-10">
          <img
            src="https://i.ibb.co/FW5MnYg/krm1.png"
            alt="logo"
            className="w-64 absolute top-0 xl:right-0 lg:right-0 md:right-0 "
          />
          <div className="icons-wrapper absolute top-4 left-4 xl:flex lg:flex md:flex gap-4 hidden ">
            <img
              onClick={() => {
                notify(
                  "Greetings!",
                  "We are working on it. It will be available soon."
                );
              }}
              src="https://i.ibb.co/s91TwQh/chrome-Extention.webp"
              alt="logo"
              className="w-36 border-2 border-gray-800 rounded-md p-2 cursor-pointer"
            />
            {/* Create a button with android icon that depicts, app is available for android phone */}
            <span
              onClick={() =>
                notify(
                  "Greetings!",
                  "We are working on it. It will be available soon."
                )
              }
              className="text-2xl text-gray-800 flex gap-2 border-2 border-gray-800 rounded-md p-2 cursor-pointer "
            >
              <FaAndroid className="text-3xl text-green-500" />
              <p className="text-sm mt-1">Download Now</p>
            </span>
          </div>
        </div>

        <div className="p-10 rounded-xl xl:mt-36 lg:mt-36 mt-16">
          <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
            Free Online YouTube Audio & Video Downloader
          </h1>
          <p className="text-center text-gray-600 text-lg">
            Download YouTube videos as MP3 files in pristine quality. Quick,
            efficient, and completely free.
          </p>
        </div>

        {!downloadOptions || !downloadInfo?.title ? (
          <div
            className={`wrapper xl:flex lg:flex md:flex sm:justify-center p-10`}
          >
            <div className="multi-button ">
              <button onClick={handlePaste} className="paste">
                Paste
              </button>
            </div>
            <input
              type="text"
              placeholder="Paste YouTube video URL..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="paste-box xl:w-96 lg:w-96 md:w-96 w-full"
            />
            <div className={`multi-button-2 ${videoUrl ? "" : "hidden"}`}>
              {!loading ? (
                <button onClick={fetchOptions} className="paste">
                  Fetch
                </button>
              ) : (
                <div className="multi-button ">
                  <button className="paste animate-bounce">Fetching...</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 w-full p-10">
            <div className="multi-button-3">
              <button
                onClick={() => {
                  setDownloadOptions(null);
                  setVideoUrl("");
                  setSelectedFormat(null);
                }}
                className="paste"
              >
                Go Back
              </button>
            </div>
            <div className="xl:flex lg:flex gap-4 mt-4">
              <img
                src={downloadInfo?.thumbnail_url}
                alt="thumbnail"
                className="w-64"
              />
              {/* Video Informations */}

              <div className="flex xl:gap-4 lg:gap-4 md:gap-2 flex-col flex-1 mt-4">
                <span className="font-bold">Title:</span>
                <span className="truncate">
                  {downloadInfo?.title?.slice(0, 34)}
                </span>

                <span className="font-bold">Author:</span>
                <span className="truncate">{downloadInfo?.author}</span>

                <span className="font-bold">Duration:</span>
                <span className="truncate">{downloadInfo?.length} seconds</span>
              </div>
              <div className="bg-gray-800 w-1 xl:block lg:block md:block hidden"></div>
              <div className="flex space-x-4 mt-4 flex-1 ">
                <div className="video-formats">
                  <span className="font-bold">Video: </span>
                  <div className="flex flex-wrap">
                    {downloadOptions?.video?.map((format) =>
                      loading && selectedFormat === format ? (
                        <div className="multi-button-3">
                          <button className="paste animate-bounce">
                            Downloading...
                          </button>
                        </div>
                      ) : (
                        <div className="multi-button-3">
                          <button
                            onClick={() => {
                              setSelectedFormat(format);
                              handleDownload(format);
                            }}
                            className="paste"
                          >
                            {format}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="audio-formats">
                  <span className="font-bold">Audio: </span>
                  <div className="flex flex-wrap">
                    {downloadOptions?.audio?.map((format) =>
                      loading && selectedFormat === format ? (
                        <div className="multi-button-3">
                          <button className="paste animate-bounce">
                            Downloading...
                          </button>
                        </div>
                      ) : (
                        <div className="multi-button-3">
                          <button
                            onClick={() => {
                              setSelectedFormat(format);
                              handleDownload(format);
                            }}
                            className="paste"
                          >
                            {format}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Thanks for using our tools  */}
      
      <div className={`w-full text-center p-4 ${!country?.includes("IN") && "hidden"}`}>
        <p>
          Special thanks to{" "}
          <span role="img" aria-label="heart">
            ❤️
          </span>{" "}
          <a
            href
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            SI Bhavna Verma
          </a>
        </p>
      </div>

      <Toaster />
    </main>
  );
};

export default App;
