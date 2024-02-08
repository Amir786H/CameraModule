import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Button,
  TouchableOpacity,
  Text,
  BackHandler,
  Image,
  Alert
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCameraDevice
} from 'react-native-vision-camera';

function CameraScreen(props) {
  const camera = useRef(null);
  const devices = useCameraDevice('back');

  const resolutions = [
    {width: 640, height: 480, pixel: '480p'},
    {width: 1280, height: 720, pixel: '720p'},
    {width: 1920, height: 1080, pixel: '1080p'},
  ];

  const [showCamera, setShowCamera] = useState(false);
  const [imageSource, setImageSource] = useState('');

  // const [isRecording, setIsRecording] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(resolutions[0]);

  useEffect(() => {
    async function getPermission() {
      const newCameraPermission = await Camera.requestCameraPermission();
      console.log(newCameraPermission);
    }
    getPermission();
  }, []);


  //Can be used for clicking Photo
  const handleTakePicture = async () => {
    if (camera.current !== null) {
      const options = {
        quality: 0.5,
        width: selectedResolution.width,
        height: selectedResolution.height,
      };
      const photo = await camera.current.takePhoto(options);
      setImageSource(photo.path);
      setShowCamera(false);
      // console.log('PHOTO DATA:', photo);
    }
  };

  /**
   * The `calcVideoSize` function calculates the size of a video based on its duration, resolution, and
   * bitrate, and then logs and alerts the result.
   * @param duration - The `duration` parameter represents the duration of the video in seconds.
   */
  const calcVideoSize = async (duration) => {
    const bitrate = 4000000;
    const videoSizeMB = calculateVideoSize(
      selectedResolution.pixel,
      bitrate,
      duration,
    );
    console.log('Video Size (MB):', videoSizeMB); // Output: Video Size (MB): 30
    alertHandler(Number(videoSizeMB.toFixed(2)));
  };

  //Custom function for video size calc
  function calculateVideoSize(resolution, bitrate, duration) {
    const resolutionMultiplier = {
      '480p': 1,
      '720p': 2,
      '1080p': 3,
    };
    const bitrateMbps = bitrate / 1000000; // Convert bitrate from bps to Mbps
    const sizeMB =
      (bitrateMbps * resolutionMultiplier[resolution] * duration) / 8; // Calculate size in megabytes
    return sizeMB;
  }

  //Start the video recording
  const startRecording = async () => {
    camera.current.startRecording({
      videoCodec: 'h265',
      onRecordingFinished: video => {
        calcVideoSize(video.duration);
      },
      onRecordingError: error => console.error(error),
    });
  };

  //Stop video recording
  const stopRecording = async () => {
    await camera.current.stopRecording();
  };

  const alertHandler = (data) => {
    Alert.alert(
      'Hello',
      `Video Size (MB): ${data}`,
      [
        {
          text: 'Ok',
          onPress: () => console.log('Ok Pressed')
        }
      ],
      {cancelable: false},
      //clicking out side of alert will not cancel
    );
  };

  if (devices == null) {
    return <Text>Camera not available</Text>;
  }

  return (
    <View style={styles.container}>
      {showCamera ? (
        <>
          <Camera
            {...props}
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={devices}
            isActive={showCamera}
            photo={true}
            video={true}
          />

          <View
            style={[
              styles.backButton,
              {
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                right: 85,
              },
            ]}>
            <Text>Select Resolution:</Text>
            {resolutions.map((resolution, index) => (
              <TouchableOpacity
                style={styles.resolListStyle}
                key={index}
                onPress={() => setSelectedResolution(resolution)}>
                <Text
                  style={{
                    color: 'white',
                  }}>{`${resolution.pixel}`}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.cameraShutterContainer}>
            {/* <TouchableOpacity
              style={styles.camButton}
              onPress={() => handleTakePicture()}
            /> */}
            <TouchableOpacity
              style={styles.camButton}
              onPress={() => startRecording()}
            />
            <TouchableOpacity
              style={styles.videoButton}
              onPress={() => stopRecording()}
            />
          </View>
        </>
      ) : (
        <>
          {imageSource !== '' ? (
            <Image
              style={styles.image}
              source={{
                uri: `file://'${imageSource}`,
              }}
            />
          ) : null}

          <View style={styles.backButton}>
            <TouchableOpacity
              style={styles.showcamera}
              onPress={() => setShowCamera(true)}>
              <Text style={styles.commonTextStyle}>Show Camera</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => setShowCamera(true)}>
                <Text style={{color: '#77c3ec', fontWeight: '500'}}>
                  Retake
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.usephoto}
                onPress={() => setShowCamera(true)}>
                <Text style={styles.commonTextStyle}>
                  Use Photo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'gray',
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.0)',
    position: 'absolute',
    justifyContent: 'center',
    width: '100%',
    top: 0,
    padding: 20,
  },
  buttonContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    bottom: 0,
    padding: 20,
  },
  cameraShutterContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    bottom: 0,
    padding: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  camButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    //ADD backgroundColor COLOR GREY
    backgroundColor: '#B2BEB5',
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  videoButton: {
    height: 60,
    width: 60,
    borderRadius: 40 / 2,
    //ADD backgroundColor COLOR GREY
    backgroundColor: 'red',
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: 'red',
  },
  image: {
    width: '100%',
    height: '100%',
    aspectRatio: 9 / 16,
  },
  resolListStyle: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    width: 100,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: 'white',
  },
  retakeButton: {
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#77c3ec',
  },
  usephoto: {
    backgroundColor: '#77c3ec',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  showcamera: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    width: 100,
  },
  commonTextStyle: {color: 'white', fontWeight: '500'}
});

export default CameraScreen;
