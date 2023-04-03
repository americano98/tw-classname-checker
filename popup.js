window.onload = function () {
  const resultElement = document.querySelector('.result');
  
  findErrors.addEventListener('click', async (e) => {
    e.preventDefault();
    resultElement.innerHTML = "";
    resultElement.classList.remove('result-active');
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {type:"GET_ERRORS"});
    
    resultElement.classList.add('result-active');
    const title = document.createElement('p');
    if (!response.isPageLoaded) {
      title.innerText = 'Pull request still loading, please wait for a while';
      title.style.color = 'grey'
      resultElement.appendChild(title);
      return;
    }
    findErrors.remove();
    
    const {errors} = response;
    if (errors.length === 0) {
      title.innerText = "Congrats! Pull requst doesn't cointain any error";
      title.style.color = 'green';
      resultElement.appendChild(title);
      return;
    }

    const errorsList = document.createElement('ul');
    title.innerText = `Pull requst cointains ${errors.length} errors:`;
    title.style.color = 'red';
    errors.map(({value, changeTo, anchor}) => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.innerHTML = `${value} => ${changeTo}`;
      const button = document.createElement('button');
      button.innerText = "To error";
      button.addEventListener('click', () => {
        e.preventDefault();
        chrome.tabs.sendMessage(tab.id, {type:"SCROLL_TO_ERROR", anchor});
      })
      li.appendChild(span)
      li.appendChild(button)
      errorsList.appendChild(li);
    })
    resultElement.appendChild(title);
    resultElement.appendChild(errorsList);
  })
}