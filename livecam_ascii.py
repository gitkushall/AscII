#!/usr/bin/env python3
"""
LiveCam ASCII Filter — Real-Time Webcam to Text Art Converter

Converts live webcam feed into ASCII art in real-time.
Darker areas become heavier characters (@, #), brighter areas become lighter characters (., space).
"""

import cv2
import sys
import os
import time


class ASCIIConverter:
    """Converts image frames to ASCII art."""
    
    # Character sets from darkest to lightest
    CHAR_SETS = {
        'standard': '@%#*+=-:. ',
        'dense': '@#$%&*+=-:. ',
        'light': ' .:-=+*#%@',
        'minimal': '@. ',
    }
    
    def __init__(self, char_set='standard', invert=False):
        """
        Initialize ASCII converter.
        
        Args:
            char_set: Which character set to use ('standard', 'dense', 'light', 'minimal')
            invert: If True, invert brightness (dark becomes light)
        """
        self.char_set = self.CHAR_SETS.get(char_set, self.CHAR_SETS['standard'])
        self.invert = invert
        
        if self.invert:
            self.char_set = self.char_set[::-1]
    
    def pixel_to_char(self, brightness):
        """
        Convert a pixel brightness value (0-255) to an ASCII character.
        
        Args:
            brightness: Grayscale pixel value (0 = black, 255 = white)
        
        Returns:
            ASCII character representing this brightness level
        """
        # Normalize brightness to character set index
        # Map 0-255 to 0-(len(char_set)-1)
        index = int((brightness / 255.0) * (len(self.char_set) - 1))
        index = max(0, min(index, len(self.char_set) - 1))
        return self.char_set[index]
    
    def frame_to_ascii(self, frame, width=120, height=60):
        """
        Convert a video frame to ASCII art string.
        
        Args:
            frame: OpenCV frame (BGR image)
            width: Target ASCII width (columns)
            height: Target ASCII height (rows)
        
        Returns:
            Multi-line string containing ASCII art
        """
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Resize to target dimensions
        resized = cv2.resize(gray, (width, height), interpolation=cv2.INTER_AREA)
        
        # Convert each pixel to ASCII character
        ascii_lines = []
        for row in resized:
            ascii_line = ''.join(self.pixel_to_char(pixel) for pixel in row)
            ascii_lines.append(ascii_line)
        
        return '\n'.join(ascii_lines)


class LiveCamASCII:
    """Main application class for live ASCII webcam feed."""
    
    def __init__(self, width=120, height=60, char_set='standard', invert=False):
        """
        Initialize the live camera ASCII converter.
        
        Args:
            width: ASCII output width (columns)
            height: ASCII output height (rows)
            char_set: Character set to use
            invert: Invert brightness mapping
        """
        self.width = width
        self.height = height
        self.converter = ASCIIConverter(char_set=char_set, invert=invert)
        self.cap = None
        self.running = False
        self.frame_count = 0
        self.start_time = None
    
    def clear_screen(self):
        """Clear the terminal screen."""
        os.system('clear' if os.name != 'nt' else 'cls')
    
    def print_header(self):
        """Print startup header with instructions."""
        print("=" * 60)
        print("  LiveCam ASCII Filter — Real-Time Webcam to Text Art")
        print("=" * 60)
        print(f"Resolution: {self.width}x{self.height} characters")
        print(f"Character set: {self.converter.char_set}")
        print(f"Inverted: {self.converter.invert}")
        print("\nInstructions:")
        print("  • Press 'q' to quit")
        print("  • Resize terminal for best viewing experience")
        print("  • Larger terminal = better detail")
        print("=" * 60)
        print("\nStarting camera...\n")
        time.sleep(1)
    
    def initialize_camera(self):
        """Initialize webcam capture."""
        self.cap = cv2.VideoCapture(0)
        
        if not self.cap.isOpened():
            print("ERROR: Could not open webcam.")
            print("\nTroubleshooting:")
            print("  • Check if webcam is connected")
            print("  • On macOS: Grant camera permissions in System Preferences")
            print("  • Try a different camera index (change 0 to 1 in code)")
            return False
        
        # Set camera properties for better performance
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        return True
    
    def calculate_fps(self):
        """Calculate and return current FPS."""
        if self.start_time is None:
            self.start_time = time.time()
            return 0.0
        
        elapsed = time.time() - self.start_time
        if elapsed > 0:
            fps = self.frame_count / elapsed
            return fps
        return 0.0
    
    def run(self):
        """Main application loop."""
        if not self.initialize_camera():
            return
        
        self.clear_screen()
        self.print_header()
        
        self.running = True
        self.start_time = time.time()
        
        try:
            while self.running:
                ret, frame = self.cap.read()
                
                if not ret:
                    print("ERROR: Failed to read frame from camera.")
                    break
                
                # Convert frame to ASCII
                ascii_art = self.converter.frame_to_ascii(
                    frame, 
                    width=self.width, 
                    height=self.height
                )
                
                # Clear screen and print ASCII art
                self.clear_screen()
                print(ascii_art)
                
                # Print status line
                self.frame_count += 1
                fps = self.calculate_fps()
                status = f"FPS: {fps:.1f} | Frames: {self.frame_count} | Press 'q' to quit"
                print("\n" + "-" * 60)
                print(status)
                
                # Check for quit key (non-blocking)
                # Note: cv2.waitKey doesn't work well in terminal mode
                # We'll use a timeout and check for keyboard interrupt instead
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    self.running = False
                    break
                
                # Small delay to prevent overwhelming the terminal
                time.sleep(0.03)  # ~30 FPS max
                
        except KeyboardInterrupt:
            print("\n\nInterrupted by user.")
        
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up resources."""
        if self.cap is not None:
            self.cap.release()
        cv2.destroyAllWindows()
        print("\nCamera released. Goodbye!")


def main():
    """Main entry point."""
    # Configuration
    ASCII_WIDTH = 120   # Number of columns
    ASCII_HEIGHT = 60   # Number of rows
    CHAR_SET = 'standard'  # Options: 'standard', 'dense', 'light', 'minimal'
    INVERT = False      # Set to True to invert brightness
    
    # Create and run the application
    app = LiveCamASCII(
        width=ASCII_WIDTH,
        height=ASCII_HEIGHT,
        char_set=CHAR_SET,
        invert=INVERT
    )
    
    app.run()


if __name__ == '__main__':
    main()
