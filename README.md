# LiveCam ASCII Filter — Real-Time Webcam to Text Art Converter

Convert your live webcam feed into ASCII art in real-time! This project transforms video frames into text-based art where darker areas become "heavier" characters (like `@`, `#`) and brighter areas become lighter characters (like `.` or space).

## Features

- 🎥 **Real-time webcam capture** - Live video feed processing
- 🎨 **ASCII art conversion** - Converts pixels to text characters
- ⚡ **Configurable resolution** - Adjust output size for performance
- 🎭 **Multiple character sets** - Choose from different ASCII styles
- 🔄 **Invert mode** - Reverse brightness mapping
- 📊 **FPS counter** - Monitor performance in real-time

## Requirements

- Python 3.7+
- Webcam/camera device
- OpenCV (`opencv-python`)
- NumPy (usually comes with OpenCV)

## Installation

1. **Clone or download this project**

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **On macOS - Grant camera permissions:**
   - Go to **System Preferences** → **Security & Privacy** → **Privacy** → **Camera**
   - Enable camera access for Terminal (or your Python IDE)

## Web Version (Recommended)

A browser-based version with **both camera and photo upload** support, plus high-detail character sets for clearer images.

**Run the web app:**
```bash
cd ascii
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

**Features:**
- 📷 **Live camera** — real-time ASCII from webcam
- 🖼️ **Upload photo** — convert any image to ASCII
- **Character density** — Ultra (70 chars), High (40 chars), Medium, Standard
- **Resolution slider** — 60–180 columns for more/less detail
- **Invert** — swap dark/light mapping

---

## Terminal Usage

### Basic Usage

Run the Python script:
```bash
python livecam_ascii.py
```

Press `q` to quit (or Ctrl+C).

### Configuration

Edit the configuration variables at the bottom of `livecam_ascii.py`:

```python
ASCII_WIDTH = 120   # Number of columns (horizontal)
ASCII_HEIGHT = 60   # Number of rows (vertical)
CHAR_SET = 'standard'  # Options: 'standard', 'dense', 'light', 'minimal'
INVERT = False      # Set to True to invert brightness
```

### Character Sets

- **`standard`**: `@%#*+=-:. ` (balanced, good for most scenes)
- **`dense`**: `@#$%&*+=-:. ` (more characters, smoother gradients)
- **`light`**: ` .:-=+*#%@` (reversed, lighter feel)
- **`minimal`**: `@. ` (only 3 characters, very fast)

### Tips for Best Experience

1. **Terminal size**: Larger terminals show more detail
2. **Resolution**: Smaller ASCII resolution (e.g., 80x40) = faster FPS
3. **Lighting**: Good lighting improves contrast and clarity
4. **Background**: Simple backgrounds work best

## How It Works

### Pipeline

1. **Capture Frame**: Reads frame from webcam using OpenCV
2. **Grayscale Conversion**: Converts color (BGR) → grayscale (0-255)
3. **Resize**: Shrinks image to target ASCII grid size
4. **Brightness Mapping**: Maps each pixel value to an ASCII character
   - Dark pixels (0-50) → `@` or `#`
   - Medium pixels (100-150) → `*` or `+`
   - Light pixels (200-255) → `.` or space
5. **Render**: Prints ASCII string to terminal, clears screen, repeats

### Technical Details

- Uses OpenCV for camera capture and image processing
- Grayscale conversion reduces color complexity
- Resizing controls ASCII "resolution" and performance
- Character mapping quantizes continuous brightness into discrete symbols
- Terminal rendering uses screen clearing for animation effect

## Troubleshooting

### Camera Not Opening

**macOS:**
- Grant camera permissions in System Preferences
- Check if another app is using the camera
- Try changing camera index from `0` to `1` in code

**Linux:**
- Check camera device: `ls /dev/video*`
- Install `v4l-utils` if needed
- Check permissions: `sudo chmod 666 /dev/video0`

**Windows:**
- Check Device Manager for camera
- Ensure camera drivers are installed
- Try different camera index

### Low FPS / Laggy Output

- Reduce `ASCII_WIDTH` and `ASCII_HEIGHT`
- Use `minimal` character set
- Close other applications using the camera
- Reduce terminal window size

### Poor Quality Output

- Increase `ASCII_WIDTH` and `ASCII_HEIGHT`
- Improve lighting conditions
- Use `dense` character set for smoother gradients
- Adjust camera focus

## Future Enhancements

- [ ] Color ASCII art (using ANSI color codes)
- [ ] GUI window display (cleaner than terminal)
- [ ] Save output as text file or image
- [ ] Export GIF / video clip
- [ ] Adjustable contrast and brightness
- [ ] Multiple camera support
- [ ] Custom character set input
- [ ] Real-time configuration menu

## Learning Outcomes

This project teaches:

- **OpenCV basics**: Camera capture, frame processing, image manipulation
- **Image processing**: Grayscale conversion, resizing, sampling
- **Data mapping**: Converting continuous values (0-255) to discrete categories (characters)
- **Real-time processing**: Frame rate considerations, performance optimization
- **Terminal rendering**: Screen clearing, animation techniques

## Real-World Applications

Similar techniques are used in:

- Video filters (Snapchat/Instagram effects)
- OCR preprocessing (text cleaning before recognition)
- Edge detection and feature extraction
- Streaming video processing (security cameras, robotics)
- Data compression (efficient representation)

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to fork, modify, and improve! Some ideas:

- Add color support
- Create a GUI version
- Optimize performance
- Add more character sets
- Implement recording features

---

**Enjoy creating ASCII art from your webcam!** 🎨📹
