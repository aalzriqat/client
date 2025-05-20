import React, { Fragment } from "react"; // React should be imported directly
import spinner from '../../assets/spinner.gif'; // Assuming this path is correct and spinner.gif exists

const Spinner: React.FC = () => { // Added React.FC
    return (
        <Fragment>
            <img 
                src={spinner} 
                alt="Loading..." 
                style={{ width: '200px', margin: 'auto', display: 'block' }}
            />
        </Fragment>
    );
};

export default Spinner;