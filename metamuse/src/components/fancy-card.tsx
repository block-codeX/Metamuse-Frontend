import { FC, use } from "react";

interface ProjectCardProps {
    title: string;
    _id: string;
    useTitle?: boolean; // Optional prop to control title display
    }
const FancyProjectCard: FC<ProjectCardProps> = ({ title, _id, useTitle }) => {
    // Function to generate consistent color based on string input
    const stringToColor = (str: any) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      // Create more vibrant colors by using specific hue ranges
      const hue = Math.abs(hash) % 360;
      
      // Based on the name, adjust saturation and lightness
      const vowelCount = (title.match(/[aeiou]/gi) || []).length;
      const saturation = 65 + (vowelCount * 5) % 35; // 65-100%
      const lightness = 55 + (title.length % 20); // 55-75%
      
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };
    
    // Extract different parts of the ObjectId for different colors
    const getGradientColors = () => {
      if (!_id || _id.length < 12) {
        // Fallback if _id is invalid
        return [
          stringToColor(title + '1'), 
          stringToColor(title + '2'),
          stringToColor(title + '3')
        ];
      }
      
      // Use different segments of the ObjectId to create variation
      const part1 = _id.substring(0, 8);
      const part2 = _id.substring(8, 16);
      const part3 = _id.substring(16, 24);
      
      return [
        stringToColor(part1 + title),
        stringToColor(part2 + title),
        stringToColor(part3 + title)
      ];
    };
    
    // Generate gradient angle based on name length
    const getGradientAngle = () => {
      return ((title.length * 47) % 360);
    };
    
    const colors = getGradientColors();
    const angle = getGradientAngle();
    
    // Determine if we should use a mesh gradient or linear gradient
    // based on characteristics of the name and ID
    const useMeshGradient = title.length % 2 === 0;
    
    // Style for card
    const cardStyle = {
      width: '300px',
      height: '200px',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      cursor: 'pointer',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    };
    
    // Create linear gradient background
    const linearGradientStyle = {
      background: `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
      width: '100%',
      height: '100%',
      position: 'absolute',
    };
    
    // Create mesh gradient background (simulated with radial gradients)
    const meshGradientStyle = {
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: `radial-gradient(circle at 20% 20%, ${colors[0]} 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, ${colors[1]} 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, ${colors[2]} 0%, transparent 50%),
                  ${colors[0]}`,
    };
    
    // Text style
    const textStyle = {
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      zIndex: 10,
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    };
    
    // Hover effect
    const cardHoverStyle = {
      transform: 'translateY(-5px)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    };
    
    // Combined style object
    const combinedCardStyle = {
      ...cardStyle,
      '&:hover': cardHoverStyle,
    };
  
    return (
      <div className="group relative rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl h-full">
        <div className="absolute inset-0">
          {useMeshGradient ? (
            <div style={meshGradientStyle} />
          ) : (
            <div style={linearGradientStyle} />
          )}
          
          {/* Optional overlay for better text visibility */}
          <div className="absolute inset-0 bg-black opacity-20" />
        </div>
        
        {useTitle && (
            <div className="relative p-6 h-48 flex flex-col justify-between">
            <div className="text-white font-bold text-xl mb-2 truncate">{title}</div>
          </div>
          )}
      </div>
    );
  };

export default FancyProjectCard;
  