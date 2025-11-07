

class Task {
  constructor({ id, title, responsible, start, end, priority, notes, done }){
    this.id = id ?? Task.nextId();
    this.title = title ?? '';
    this.responsible = responsible ?? '';
    this.start = start ?? '';
    this.end = end ?? '';
    this.priority = priority ?? 'media';
    this.notes = notes ?? '';
    this.done = !!done;
  }

  static nextId(){
    Task._id = (Task._id ?? 0) + 1;
    return Task._id;
  }
}

// Manager: Tasks container + persistencia
const TaskManager = {
  tasks: [],
  storageKey: 'todo_app_v1',
  initFrom(tasksArr){
    this.tasks = tasksArr.map(t => new Task(t));

    const maxId = this.tasks.reduce((m, t) => Math.max(m, t.id || 0), 0);
    Task._id = maxId;
  },
  add(task){
    this.tasks.push(new Task(task));
  },
  removeById(id){
    this.tasks = this.tasks.filter(t => t.id !== id);
  },
  markDone(id, done = true){
    const t = this.tasks.find(x => x.id === id);
    if(t){ t.done = !!done; }
  },
  clearDone(){
    this.tasks = this.tasks.filter(t => !t.done);
  },
  toJSON(){
    return JSON.stringify(this.tasks);
  },
  save(){
    localStorage.setItem(this.storageKey, this.toJSON());
  },
  load(){
    const raw = localStorage.getItem(this.storageKey);
    if(!raw) return false;
    try{
      const arr = JSON.parse(raw);
      if(!Array.isArray(arr)) return false;
      this.initFrom(arr);
      return true;
    }catch(e){
      console.error('Erro ao recuperar dados:', e);
      return false;
    }
  },
  clearStorage(){
    localStorage.removeItem(this.storageKey);
  }
};

// UI binding
document.addEventListener('DOMContentLoaded', ()=> {
  const form = document.getElementById('taskForm');
  const addBtn = document.getElementById('addBtn');
  const resetForm = document.getElementById('resetForm');
  const livePreview = document.getElementById('livePreview');
  const pendingList = document.getElementById('pendingList');
  const doneList = document.getElementById('doneList');
  const pendingCount = document.getElementById('pendingCount');
  const doneCount = document.getElementById('doneCount');
  const saveAll = document.getElementById('saveAll');
  const loadAll = document.getElementById('loadAll');
  const clearAll = document.getElementById('clearAll');
  const clearDoneView = document.getElementById('clearDoneView');

  // form inputs
  const inp = {
    title: document.getElementById('title'),
    responsible: document.getElementById('responsible'),
    start: document.getElementById('start'),
    end: document.getElementById('end'),
    priority: document.getElementById('priority'),
    notes: document.getElementById('notes')
  };

  //validação básica
  function validateForm(){
    // title required
    if(!inp.title.value.trim()){
      inp.title.setCustomValidity('Título obrigatório');
      return false;
    } else {
      inp.title.setCustomValidity('');
    }

    // start <= end
    if(inp.start.value && inp.end.value){
      const s = new Date(inp.start.value);
      const e = new Date(inp.end.value);
      if(s > e){
        inp.end.setCustomValidity('Data fim deve ser igual/maior que início');
        return false;
      } else {
        inp.end.setCustomValidity('');
      }
    } else {
      inp.end.setCustomValidity('');
    }

    return true;
  }

  // preview
  function renderPreview(){
    const data = {
      title: inp.title.value.trim() || '— sem título —',
      responsible: inp.responsible.value.trim() || '— ninguém —',
      start: inp.start.value || '—',
      end: inp.end.value || '—',
      priority: inp.priority.value,
      notes: inp.notes.value.trim() || ''
    };

    livePreview.classList.remove('empty');
    livePreview.innerHTML = `
      <div>
        <h3>${escapeHtml(data.title)}</h3>
        <div class="meta small">${escapeHtml(data.responsible)} • ${escapeHtml(data.start)} → ${escapeHtml(data.end)}</div>
        <div class="tags">
          <span class="tag">Prioridade: ${escapeHtml(data.priority)}</span>
        </div>
        <p class="muted">${escapeHtml(data.notes) || '<span class="muted">Sem observações</span>'}</p>
      </div>
    `;
  }

  // escape pra evitar injection quando renderiza
  function escapeHtml(s){
    if(!s) return '';
    return s
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#39;');
  }

  // rerenderizar listas
  function renderLists(){
    pendingList.innerHTML = '';
    doneList.innerHTML = '';

    const pending = TaskManager.tasks.filter(t => !t.done);
    const done = TaskManager.tasks.filter(t => t.done);

    pending.forEach(t => {
      pendingList.appendChild(taskElement(t));
    });

    done.forEach(t => {
      doneList.appendChild(taskElement(t));
    });

    pendingCount.textContent = pending.length;
    doneCount.textContent = done.length;
  }

  // criar DOM pra tarefa
  function taskElement(t){
    const li = document.createElement('li');
    li.className = 'task' + (t.done ? ' done' : '');
    li.setAttribute('data-id', t.id);

    const left = document.createElement('div'); left.className = 'left';
    const title = document.createElement('h3'); title.textContent = t.title;
    const small = document.createElement('div'); small.className = 'small';
    small.textContent = `${t.responsible || '—'} • ${t.start || '—'} → ${t.end || '—'}`;

    const tags = document.createElement('div'); tags.className = 'tags';
    const tagPriority = document.createElement('span'); tagPriority.className='tag'; tagPriority.textContent = `Prioridade: ${t.priority}`;
    tags.appendChild(tagPriority);

    const notes = document.createElement('p'); notes.className='muted';
    notes.textContent = t.notes || '';

    left.appendChild(title);
    left.appendChild(small);
    left.appendChild(tags);
    left.appendChild(notes);

    const controls = document.createElement('div'); controls.className='controls';
    const markBtn = document.createElement('button'); markBtn.className='icon-btn mark';
    markBtn.type = 'button';
    markBtn.textContent = t.done ? 'Reabrir' : 'Concluir';
    markBtn.title = t.done ? 'Marcar como não concluída' : 'Marcar concluída';
    markBtn.addEventListener('click', ()=> {
      TaskManager.markDone(t.id, !t.done);
      renderLists();
    });

    controls.appendChild(markBtn);

    // botão de editar
    const editBtn = document.createElement('button'); editBtn.className='icon-btn';
    editBtn.type='button';
    editBtn.textContent = 'Editar';
    editBtn.title = 'Editar tarefa (preenche o formulário acima)';
    editBtn.addEventListener('click', ()=> {
      populateFormForEdit(t.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    controls.appendChild(editBtn);

    // delete (aparece só pra tarefas concluídas)
    if(t.done){
      const delBtn = document.createElement('button'); delBtn.className='icon-btn delete';
      delBtn.type='button';
      delBtn.textContent = 'Excluir';
      delBtn.title = 'Excluir tarefa (remover permanentemente)';
      delBtn.addEventListener('click', ()=> {
        TaskManager.removeById(t.id);
        renderLists();
      });
      controls.appendChild(delBtn);
    }

    li.appendChild(left);
    li.appendChild(controls);

    return li;
  }

  // editar task existente
  function populateFormForEdit(id){
    const t = TaskManager.tasks.find(x => x.id === id);
    if(!t) return;
    inp.title.value = t.title;
    inp.responsible.value = t.responsible;
    inp.start.value = t.start;
    inp.end.value = t.end;
    inp.priority.value = t.priority;
    inp.notes.value = t.notes;
    renderPreview();

    // se tem um id igual, update
    form.dataset.editId = String(id);
    addBtn.textContent = 'Salvar edição';
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if(!validateForm()){
      // validação
      form.reportValidity();
      return;
    }

    const payload = {
      title: inp.title.value.trim(),
      responsible: inp.responsible.value.trim(),
      start: inp.start.value || '',
      end: inp.end.value || '',
      priority: inp.priority.value,
      notes: inp.notes.value.trim(),
      done: false
    };

    const editId = form.dataset.editId ? Number(form.dataset.editId) : null;
    if(editId){
      // update existindo
      const t = TaskManager.tasks.find(x => x.id === editId);
      if(t){
        Object.assign(t, payload);
      }
      delete form.dataset.editId;
      addBtn.textContent = 'Adicionar tarefa';
    } else {
      TaskManager.add(payload);
    }

    form.reset();
    livePreview.innerHTML = '<p class="muted">Preencha o formulário para ver a pré-visualização</p>';
    livePreview.classList.add('empty');
    renderLists();
  });

  resetForm.addEventListener('click', ()=> {
    form.reset();
    delete form.dataset.editId;
    addBtn.textContent = 'Adicionar tarefa';
    livePreview.innerHTML = '<p class="muted">Preencha o formulário para ver a pré-visualização</p>';
    livePreview.classList.add('empty');
  });

  // live preview quando input
  ['input','change'].forEach(evt => {
    Object.values(inp).forEach(i => i.addEventListener(evt, ()=>{
      //mostra placeholder se nao tem conteúdo pra mostrar
      const any = inp.title.value || inp.responsible.value || inp.notes.value;
      if(!any && !inp.start.value && !inp.end.value){
        livePreview.innerHTML = '<p class="muted">Preencha o formulário para ver a pré-visualização</p>';
        livePreview.classList.add('empty');
      } else {
        renderPreview();
      }
    }));
  });

  // storage control
  saveAll.addEventListener('click', ()=> {
    TaskManager.save();
    // feedback visual: flash button
    animateFlash(saveAll);
  });

  loadAll.addEventListener('click', ()=> {
    const ok = TaskManager.load();
    if(ok){
      renderLists();
      animateFlash(loadAll);
    } else {
      // nada pra recuperar; feedback gentil (sem alert)
      loadAll.textContent = 'Nada p/ recuperar';
      setTimeout(()=> loadAll.textContent = 'Recuperar dados', 1200);
    }
  });

  clearAll.addEventListener('click', ()=> {
    // limpar storage e app state
    TaskManager.clearStorage();
    TaskManager.tasks = [];
    renderLists();
    animateFlash(clearAll);
  });

  // excluir todas concluidas (permanente)
  clearDoneView.addEventListener('click', ()=> {
    TaskManager.clearDone();
    renderLists();
  });

  // animação simples
  function animateFlash(el){
    el.animate([{ transform: 'translateY(-2px)'},{ transform:'translateY(0)' }], { duration:220, easing:'ease-out' });
  }

  // restaura quietinho onload
  (function tryAutoLoad(){
    const ok = TaskManager.load();
    if(ok) renderLists();
  })();

  // renderizar listas (vazio)
  renderLists();

});
