// import reduxNormalizer from '../common/utils/model';
import React from 'react';
import { connect } from 'react-redux';

import { 
    onCounter1CountAdd,
    onCounter1CountSub,
    onCounter3CountAdd,
    onCounter3CountSub
} from '../store/actionCreators';

const Counter1 = React.memo(props => {
    const {
        count,
        count3,
        onCounter1CountAdd,
        onCounter1CountSub,
        onCounter3CountAdd,
        onCounter3CountSub
    } = props;
    return (
        <div>
            <div>
                <label style={{width: 100, height: 100, fontSize: '16px'}}>Counter1: {count}</label>
                <button onClick={() => onCounter1CountAdd()}> + counter1 </button>
                <button onClick={() => onCounter1CountSub()}> - counter1 </button>
            </div>
            <div>
                <label style={{width: 100, height: 100, fontSize: '16px'}}>Counter3: {count3}</label>
                <button onClick={() => onCounter3CountSub()}> - counter3 </button>
                <button onClick={() => onCounter3CountAdd()}> + counter3 </button>
            </div>
        </div>
    );
});

const stateToProps = (state) => {
    return {
    count: state.countReducer.count,
    count3: state.countReducer.count3
    }
  }
  const dispatchToProps = (dispatch) => {
    return {
      onCounter1CountAdd(){
          const action = onCounter1CountAdd();
          dispatch(action);
      },
      onCounter1CountSub(){
          const action = onCounter1CountSub();
          dispatch(action)
      },
      onCounter3CountSub(){
          const action = onCounter3CountSub();
          dispatch(action)
      },
      onCounter3CountAdd() {
          const action = onCounter3CountAdd();
          dispatch(action);
      }
    }
  }

export default connect(stateToProps, dispatchToProps)(Counter1)

