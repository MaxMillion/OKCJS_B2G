// Demo of the localStorage, FileReader
function initPhotos() {
  // saving photos information in the local storage
  // https://developer.mozilla.org/en-US/docs/Web/Guide/DOM/Storage
  var storage = {
    loadView: function loadView(viewId) {
      return JSON.parse(localStorage.getItem('view.' + viewId));
    },
    removeView: function removeView(viewId) {
      localStorage.removeItem('view.' + viewId);
    },
    saveView: function saveView(view) {
      localStorage.setItem('view.' + view.id, JSON.stringify(view));
    },
    loadViewList: function loadViewList() {
      return JSON.parse(localStorage.getItem('viewlist') || "[]");
    },
    saveViewList: function saveViewList(viewlist) {
      return localStorage.setItem('viewlist', JSON.stringify(viewlist));
    }
  };

  // logic to edit/view photos/view for demo purpose can be skipped
  var currentPanel;
  var currentViewId;

  function setPanel(name) {
    if (currentPanel === name) {
      return;
    }

    document.getElementById('main').hidden = name !== 'main';
    document.getElementById('editview').hidden = name !== 'editview';
    document.getElementById('view').hidden = name !== 'view';
    switch (name) {
    case 'main':
      initMainPanel();
      break;
    case 'editview':
      initEditView();
      break;
    case 'view':
      initShowView();
      break;
    }
    currentPanel = name;
  }

  function initMainPanel() {
    var list = storage.loadViewList();
    var views = document.getElementById('views');
    views.textContent = '';
    for (var i = 0; i < list.length; i++) {
      var viewsItem = document.createElement('div');
      viewsItem.className = 'viewsItem';
      var view = storage.loadView(list[i]);
      var img = document.createElement('img');
      img.className = 'viewsItemImg';
      img.src = view.photos.length > 0 ? view.photos[0].src : 'nophotos.png';
      viewsItem.appendChild(img);
      var a = document.createElement('a');
      a.className = 'viewsItemName';
      a.href = '#view-' + view.id;
      a.textContent = view.name;
      a.addEventListener('click', function (viewId, e) {
        showView(viewId);
        e.preventDefault();
      }.bind(null, view.id));
      viewsItem.appendChild(a);
      var editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', editView.bind(null, view.id));
      viewsItem.appendChild(editButton);
      var removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', function (viewId, item, e) {
        removeView(viewId);
        item.parentElement.removeChild(item);
      }.bind(null, view.id, viewsItem));
      viewsItem.appendChild(removeButton);
      views.appendChild(viewsItem);
    }
  }

  function refreshViewItemsList() {
    var items = document.getElementById('items');
    var view = storage.loadView(currentViewId);
    items.textContent = '';
    for (var i = 0; i < view.photos.length; i++) {
      var item = document.createElement('div');
      item.className = 'item';
      var img = document.createElement('img');
      img.src = view.photos[i].src;
      item.appendChild(img);
      item.appendChild(document.createElement('span'));
      var removeButton = document.createElement('button');
      removeButton.textContent = "Remove";
      removeButton.addEventListener('click', function (index, e) {
        var view = storage.loadView(currentViewId);
        view.photos.splice(index, 1);
        storage.saveView(view);
        refreshViewItemsList();
      }.bind(null, i));
      item.appendChild(removeButton);
      items.appendChild(item);
    }
  }

  function refreshViewName() {
    var view = storage.loadView(currentViewId);
    document.getElementById('viewname').textContent = view.name;
  }

  function initEditView() {
    refreshViewName();
    refreshViewItemsList();
  }
  // .. and some interesting stuff starts here

  function initShowView() {
    // TODO add orientation change events
  }

  function addView() {
    var view = {
      id: Date.now(),
      name: ""+ new Date(),
      photos: []
    };
    storage.saveView(view);
    var list = storage.loadViewList();
    list.push(view.id);
    storage.saveViewList(list);

    currentViewId = view.id;
    setPanel('editview');
  }

  function editView(viewId) {
    currentViewId = viewId;
    setPanel('editview');  
  }

  function showView(viewId) {
    currentViewId = viewId;
    setPanel('view');  
  }

  function removeView(viewId) {
    var list = storage.loadViewList();
    list.splice(list.indexOf(viewId), 1);
    storage.saveViewList(list);

    storage.removeView(viewId);
  }

  function addItem() {
    function rescaleAndAddImage(img) {
      var MAX_IMAGE_SIZE = 1024;
      var scale = Math.min(1, MAX_IMAGE_SIZE / img.width,
        MAX_IMAGE_SIZE / img.height);
      var canvas = document.createElement('canvas');
      canvas.width = (img.width * scale) | 0;
      canvas.height = (img.height * scale) | 0;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);

      var view = storage.loadView(currentViewId);
      view.photos.push({
        src: canvas.toDataURL('image/jpeg'),
        orientation: img.width > img.height ? 'landscape' : 'portrait'
      });
      storage.saveView(view);

      refreshViewItemsList();
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
    function readFile(file) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          rescaleAndAddImage(img);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
    function inputChanged() {
      fileInput.removeEventListener('change', inputChanged);
      for (var i = 0; i < fileInput.files.length; i++) {
        readFile(fileInput.files[i]);
      }
    }

    var fileInput = document.getElementById('newitem');
    fileInput.addEventListener('change', inputChanged);
    fileInput.click();
  }


  function bindMainHandlers() {
    document.getElementById('addview').addEventListener('click', addView);
    document.getElementById('additem').addEventListener('click', addItem);
    document.getElementById('showview').addEventListener('click', setPanel.bind(null, 'view'));
    document.getElementById('editview_back').addEventListener('click', setPanel.bind(null, 'main'));
  }

  bindMainHandlers();
  setPanel('main');
}

document.addEventListener('DOMContentLoaded', initPhotos);
