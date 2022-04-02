var taskContainer = document.getElementById('tasks');
var input = document.getElementById('todoContainer');
var saveBtn = document.getElementById('button');
var responseDiv = document.getElementById('responseStatus');

saveBtn.addEventListener('click',saveTask)

function onload(){
  getAllTasks(function(todo){
    addTaskToPanel(todo)
  })
}
onload()
function addTaskToPanel(todos){
  todos.forEach(function(task){
    createListItem(task)
  })
}

function createListItem(task){

  var list = document.createElement('div')
  list.setAttribute('class','list-item')
  var span = document.createElement('span')
  span.setAttribute('class','span')
  span.innerHTML = task.todo

  var controls = document.createElement('div')
  controls.setAttribute('class','controls')

  var rmvBtn = document.createElement('button')
  rmvBtn.setAttribute('class','controlBtn')
  rmvBtn.addEventListener('click',removeTask(task))
  rmvBtn.innerHTML='Delete'

  var edit = document.createElement('button')
  edit.setAttribute('class','controlBtn')
  edit.addEventListener('click',updateTask(task))
  edit.innerHTML='Edit'


  var isMarked = document.createElement('input')
  isMarked.setAttribute('type','checkbox')
  if (task.isDone == true){
    isMarked.checked = true
    span.style.textDecoration = 'line-through'
  }
  isMarked.onchange = changeCheckStatus(task)

  controls.appendChild(isMarked)
  controls.appendChild(edit)
  controls.appendChild(rmvBtn)
  list.appendChild(span)
  list.appendChild(controls)
  taskContainer.appendChild(list)
}

// to save task that is entered in task area

function saveTask(){
  var inputTaskContent=input.value.trim()
  if (inputTaskContent.length !== 0){
    data ={
      todo: inputTaskContent, 
      isDone:false, 
      id: Date.now()
      }
    var body = JSON.stringify(data)
    var request = new XMLHttpRequest()
    request.open('POST','/save')
    request.setRequestHeader('Content-type','application/json')
    request.send(body)
    request.addEventListener('load',()=>{
      createListItem(data)
      input.value=''
      responseDivInnerHtml(request.responseText)
    })

  }
}
// to update task 

function updateTask(task){
  return function(event){
    event.stopPropagation()
    var editedTask=prompt('Enter the updated task')
    if(editedTask.trim() !== ''){
    var body ={
      updatedTodo: editedTask,
      id: task.id
    }
   var request = new XMLHttpRequest()
   request.open('POST','/update')
   request.setRequestHeader('Content-type','application/json')
   request.send(JSON.stringify(body))
   request.addEventListener('load',function(){
     var listItem = event.target.parentNode.parentNode
     listItem.firstChild.innerHTML= editedTask
      responseDivInnerHtml(request.responseText)

    })
    }
  }
}

// to change status of checkbox

function changeCheckStatus(task){
  return function(event){
    var doneMark = event.target
    console.log(doneMark.checked)
    var request = new XMLHttpRequest()
    request.open('POST','/doneStatus')
    var body ={ id: task.id ,isMarkDone : doneMark.checked}
    request.setRequestHeader('Content-type','application/json')
    request.send(JSON.stringify(body))
    request.addEventListener('load',function(){
      var lineThrough = doneMark.parentNode.parentNode.firstChild
      if(doneMark.checked){
        lineThrough.style.textDecoration = 'line-through'
      }else{
        lineThrough.style.textDecoration = 'none'
      }
      responseDivInnerHtml(request.responseText)

    })
  }
}

// to delete task

function removeTask(task){
  return function(event){
    event.stopPropagation()
    var rmvBtn = event.target
    var request = new XMLHttpRequest()
    data = {id: task.id}
    request.open('POST','delete')
    request.setRequestHeader('Content-type','application/json')
    request.send(JSON.stringify(data))
    request.addEventListener('load',function(){
      var listItem = rmvBtn.parentNode.parentNode
     taskContainer.removeChild(listItem)
    })
      responseDivInnerHtml(request.responseText)

  }
}

//get all tasks from server
function getAllTasks(onResponse){
  var request = new XMLHttpRequest()
  request.open('GET','/todo')
  request.setRequestHeader('Content-type','application/json')
  request.send()
  request.addEventListener('load',()=>{
    console.log(request.responseText)
    onResponse(JSON.parse(request.responseText))
  })
}


function responseDivInnerHtml(operation){
  responseDiv.innerHTML=`Task ${operation} successfully`
    var timeFlag= setTimeout(()=>{
      responseDiv.innerHTML=''
      clearTimeout(timeFlag)
    },2000)
}
