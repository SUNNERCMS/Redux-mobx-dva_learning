import 'antd/dist/antd.css';
import { Input, Button, List } from 'antd';
import React from 'react';

const TodoListUI = (props) => {
  return (
    <div style={{margin:'10px'}}>
      <div>
          <Input 
              placeholder={props.inputValue}
              style={{ width:'250px', marginRight:'10px'}}
              onChange={props.intputOnchange}
          />
          <Button 
              type="primary"
              onClick={props.addInputValue}
          >
              增加
          </Button>
      </div>
      <div style={{margin:'10px',width:'300px'}}>
          <List
              bordered
              dataSource={props.list}
              renderItem={
                  (item, index) => (
                      <List.Item onClick={() => {props.deleteItem(index)}}>{item}</List.Item>
                  )}
          />    
      </div>
    </div>
  )
}
export default TodoListUI;