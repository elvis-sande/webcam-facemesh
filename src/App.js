import React, { useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import {drawHand, drawMesh} from "./utilities";
import Webcam from "react-webcam";
import "./App.css";


function App() {
  const webcamRef = useRef(null);  // reference to webcam
  const canvasRef = useRef(null);

  const runFacemesh = async () => {  //  Load posenet/facemesh to the app to allow for detection
    const net = await facemesh.load(facemesh.SupportedPackages.mediapipeFacemesh);
    setInterval(() => {  // run detect function
      detectFace(net)}, 100);
  };

  const runHandpose = async () => {
      const net = await handpose.load();
      console.log("Hand pose model loaded.");
      setInterval(() => {  //  Loop and detect hands
          detectHand(net);
      }, 100);
  };

  const detectFace = async (net) => {  //detect function
    if (
      typeof webcamRef.current !== "undefined" &&  // webcam defined
      webcamRef.current !== null &&  // webcam is not null
      webcamRef.current.video.readyState === 4  // webcam is active?
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;  // get video from webcam ref
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      // Set canvas width and height
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      // Make Detections
      const face = await net.estimateFaces({input:video});
      console.log(face);
      // Get canvas context / draw mesh
      const ctx = canvasRef.current.getContext("2d");
      requestAnimationFrame(()=>{
          drawMesh(face, ctx)
      });
    }
  };
  useEffect(()=>{runFacemesh()}, []);


  const detectHand = async (net) => {
      const video = webcamRef.current.video;  // get video from webcam ref
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      // Make Detections
      const hand = await net.estimateHands(video);
      console.log(hand);
      // Get canvas context / draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx)
  };
  runHandpose();

// webcam and canvas components;
  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
