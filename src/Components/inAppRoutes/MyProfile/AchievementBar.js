//non component imports
import './achievementbar.css';
import {useState,useEffect} from 'react';

export default function AchievementBar(props) {
    const [percentage, setPercentage] = useState(0);
const {count}=props
useEffect(()=>{
    setPercentage(count/25)
    console.log(percentage)
})

    const achievementBarStyles = {
        width: `${percentage}%`
      };

    return (
            <div className="achievement-bar-container">
                <div className="achievement-bar" style={achievementBarStyles}></div>
                <div className="achievement-percent">{percentage}%</div>
            </div>
    )
}