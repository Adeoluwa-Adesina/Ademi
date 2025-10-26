from PIL import Image, ImageDraw, ImageFont
import math
import imageio.v2 as imageio # Using v2 for newer imageio versions

def create_speed_acceleration_gif(filename="speed_acceleration.gif", duration_per_frame=0.1):
    """
    Creates a GIF visualizing the concepts of speed and acceleration.
    """
    width, height = 800, 600
    background_color = (250, 250, 250) # Light gray
    object_color = (50, 50, 50) # Dark gray
    velocity_color = (60, 150, 255) # Blue
    acceleration_color = (255, 90, 90) # Red
    text_color = (30, 30, 30)

    object_radius = 10
    base_arrow_length = 30
    arrow_head_size = 8
    
    # Load a font
    try:
        font_label = ImageFont.truetype("arial.ttf", 14)
        font_scenario = ImageFont.truetype("arial.ttf", 18)
    except IOError:
        print("Warning: Arial font not found. Using default Pillow font.")
        font_label = ImageFont.load_default()
        font_scenario = ImageFont.load_default()

    frames = []
    num_frames = 60 # Total frames for the entire GIF

    def draw_arrow(draw_obj, start_pos, end_pos, color):
        """Helper to draw a line with an arrowhead."""
        draw_obj.line(start_pos + end_pos, fill=color, width=2)
        
        # Calculate arrow head points
        angle = math.atan2(end_pos[1] - start_pos[1], end_pos[0] - start_pos[0])
        p1 = (end_pos[0] - arrow_head_size * math.cos(angle - math.pi/6),
              end_pos[1] - arrow_head_size * math.sin(angle - math.pi/6))
        p2 = (end_pos[0] - arrow_head_size * math.cos(angle + math.pi/6),
              end_pos[1] - arrow_head_size * math.sin(angle + math.pi/6))
        draw_obj.polygon([end_pos, p1, p2], fill=color)

    for frame_idx in range(num_frames):
        current_image = Image.new('RGB', (width, height), background_color)
        draw = ImageDraw.Draw(current_image)

        # --- Top-level Title ---
        draw.text((width // 2, 20), "Speed vs. Acceleration", fill=text_color, font=ImageFont.truetype("arial.ttf", 24) if "arial.ttf" in str(font_label.path) else font_label, anchor="mm")

        # --- Scenario 1: Constant Velocity (Constant Speed, Zero Acceleration) ---
        scenario1_y = 120
        draw.text((50, scenario1_y - 30), "1. Constant Velocity (Constant Speed)", fill=text_color, font=font_scenario)
        
        t1 = (frame_idx % (num_frames // 3)) / (num_frames // 3 - 1) # Time for scenario 1
        pos1_x = 100 + t1 * 200
        pos1_y = scenario1_y + 50
        
        draw.ellipse((pos1_x - object_radius, pos1_y - object_radius, pos1_x + object_radius, pos1_y + object_radius), fill=object_color)
        draw_arrow(draw, (pos1_x, pos1_y), (pos1_x + base_arrow_length, pos1_y), velocity_color)
        draw.text((pos1_x + base_arrow_length + 5, pos1_y - 10), "Velocity", fill=velocity_color, font=font_label)
        draw.line((100, pos1_y, 300, pos1_y), fill=(200, 200, 200), width=1) # Path


        # --- Scenario 2: Increasing Speed (Constant Acceleration) ---
        scenario2_y = 300
        draw.text((50, scenario2_y - 30), "2. Increasing Speed (Acceleration)", fill=text_color, font=font_scenario)
        
        t2 = (frame_idx % (num_frames // 3)) / (num_frames // 3 - 1) # Time for scenario 2
        # Start slow, accelerate
        current_speed = 0.5 + t2 * 1.5 # Speed increases from 0.5 to 2
        pos2_x = 100 + (0.5 * t2 + 0.5 * t2**2) * 150 # Position based on acceleration
        pos2_y = scenario2_y + 50
        
        draw.ellipse((pos2_x - object_radius, pos2_y - object_radius, pos2_x + object_radius, pos2_y + object_radius), fill=object_color)
        
        # Velocity arrow grows with speed
        draw_arrow(draw, (pos2_x, pos2_y), (pos2_x + base_arrow_length * current_speed / 2, pos2_y), velocity_color)
        draw.text((pos2_x + base_arrow_length * current_speed / 2 + 5, pos2_y - 10), "Velocity", fill=velocity_color, font=font_label)
        
        # Constant acceleration arrow in same direction
        draw_arrow(draw, (pos2_x, pos2_y), (pos2_x + base_arrow_length * 0.5, pos2_y + 20), acceleration_color) # Slightly offset for clarity
        draw.text((pos2_x + base_arrow_length * 0.5 + 5, pos2_y + 10), "Acceleration", fill=acceleration_color, font=font_label)
        draw.line((100, pos2_y, 300, pos2_y), fill=(200, 200, 200), width=1) # Path


        # --- Scenario 3: Constant Speed, Changing Direction (Acceleration) ---
        scenario3_y = 480
        draw.text((50, scenario3_y - 30), "3. Turning (Constant Speed, Acceleration)", fill=text_color, font=font_scenario)
        
        t3 = (frame_idx % (num_frames // 3)) / (num_frames // 3) * (math.pi / 2) # Angle for quarter circle
        
        center_x = 200
        center_y = scenario3_y + 50
        radius = 80
        
        # Path (quarter circle)
        draw.arc((center_x - radius, center_y - radius, center_x + radius, center_y + radius),
                 start=90, end=0, fill=(200, 200, 200), width=1)
        
        pos3_x = center_x + radius * math.sin(t3)
        pos3_y = center_y - radius * math.cos(t3)
        
        draw.ellipse((pos3_x - object_radius, pos3_y - object_radius, pos3_x + object_radius, pos3_y + object_radius), fill=object_color)
        
        # Velocity arrow (tangential, constant length)
        vel_x = math.cos(t3) * base_arrow_length / 2
        vel_y = math.sin(t3) * base_arrow_length / 2
        draw_arrow(draw, (pos3_x, pos3_y), (pos3_x + vel_x, pos3_y + vel_y), velocity_color)
        draw.text((pos3_x + vel_x + 5, pos3_y - 10), "Velocity", fill=velocity_color, font=font_label)
        
        # Acceleration arrow (towards center of circle)
        acc_x = -math.sin(t3) * base_arrow_length / 2 * 0.8
        acc_y = math.cos(t3) * base_arrow_length / 2 * 0.8
        draw_arrow(draw, (pos3_x, pos3_y), (pos3_x + acc_x, pos3_y + acc_y), acceleration_color)
        draw.text((pos3_x + acc_x + 5, pos3_y + 10), "Acceleration", fill=acceleration_color, font=font_label)

        frames.append(current_image)

    # Save as GIF
    imageio.mimsave(filename, frames, duration=duration_per_frame, loop=0) # loop=0 means loop indefinitely
    print(f"GIF visualization saved as {filename}")

# Create the GIF visualization
create_speed_acceleration_gif()