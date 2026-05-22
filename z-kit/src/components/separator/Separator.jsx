import React from 'react';
import PropTypes from 'prop-types';
import './Separator.scss';

export const Separator = (props) => {
    return <div className="separator" data-orientation={`${props.orientation}`}>
    </div>
}

Separator.propTypes = {
    orientation: PropTypes.oneOf(['horizontal', 'vertical'])
}

Separator.defaultProps = {
    orientation: 'horizontal'
}