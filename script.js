<script>
  document.addEventListener('DOMContentLoaded', function() {
    // 导航功能
    let navButtons = document.querySelectorAll('.nav-btn');
    let contentSections = document.querySelectorAll('.content-section');
    const stepCards = document.querySelectorAll('.step-card');
    const backButtons = document.querySelectorAll('.back-btn');
    
    // 新增功能变量
    const addSectionBtn = document.getElementById('addSectionBtn');
    const addSectionModal = document.getElementById('addSectionModal');
    const closeSectionModal = document.getElementById('closeSectionModal');
    const addNewSection = document.getElementById('addNewSection');
    const newSectionName = document.getElementById('newSectionName');
    const contextMenu = document.getElementById('contextMenu');
    const renameSection = document.getElementById('renameSection');
    const deleteSection = document.getElementById('deleteSection');
    const renameModal = document.getElementById('renameModal');
    const closeRenameModal = document.getElementById('closeRenameModal');
    const confirmRename = document.getElementById('confirmRename');
    const renameSectionName = document.getElementById('renameSectionName');
    
    // 学习成果功能变量
    const addLearningOutcome = document.getElementById('addLearningOutcome');
    const learningOutcomeModal = document.getElementById('learningOutcomeModal');
    const closeOutcomeModal = document.getElementById('closeOutcomeModal');
    const saveLearningOutcome = document.getElementById('saveLearningOutcome');
    const outcomeTitle = document.getElementById('outcomeTitle');
    const outcomeImageInput = document.getElementById('outcomeImageInput');
    const outcomeImagePreview = document.getElementById('outcomeImagePreview');
    const outcomeUploadBtn = document.getElementById('outcomeUploadBtn');
    const outcomeImageUpload = document.getElementById('outcomeImageUpload');
    
    let currentContextButton = null;
    let uploadedImage = null;
    
    // 存储学习成果数据
    let learningOutcomes = JSON.parse(localStorage.getItem('learningOutcomes')) || [];
    
    // 初始化渲染学习成果
    renderLearningOutcomes();
    
    // 渲染学习成果
    function renderLearningOutcomes() {
        const learningGallery = document.getElementById('learningGallery');
        learningGallery.innerHTML = '';
        
        learningOutcomes.forEach((outcome, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-title', outcome.title.toLowerCase());
            galleryItem.innerHTML = `
                <img src="${outcome.image}" alt="${outcome.title}">
                <div class="gallery-item-content">
                    <div class="gallery-item-title">${outcome.title}</div>
                </div>
            `;
            learningGallery.appendChild(galleryItem);
        });
    }
    
    // 导航按钮点击事件
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            
            // 更新活动按钮
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应内容区域
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // 工作流程卡片点击事件
    stepCards.forEach(card => {
        card.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            
            // 更新活动按钮
            navButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.nav-btn[data-target="${targetId}"]`).classList.add('active');
            
            // 显示对应内容区域
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // 返回按钮点击事件
    backButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            
            // 更新活动按钮
            navButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.nav-btn[data-target="${targetId}"]`).classList.add('active');
            
            // 显示对应内容区域
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // 折叠功能
    const subsectionTitles = document.querySelectorAll('.subsection-title');
    const subsubsectionTitles = document.querySelectorAll('.subsubsection-title');
    
    subsectionTitles.forEach(title => {
        title.addEventListener('click', function() {
            const content = this.nextElementSibling;
            this.classList.toggle('collapsed');
            content.classList.toggle('collapsed');
        });
    });
    
    // 三级标题折叠功能
    subsubsectionTitles.forEach(title => {
        title.addEventListener('click', function() {
            const content = this.nextElementSibling;
            this.classList.toggle('collapsed');
            content.classList.toggle('collapsed');
        });
    });
    
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const allTextElements = document.querySelectorAll('li, .kur-tips, .step-title, .step-desc, .subsection-title, .subsubsection-title, .shortcut-desc, .key-point h3, .section-title, .gallery-item-title');
    
    // 存储所有可搜索内容
    let searchableItems = [];
    
    function updateSearchableItems() {
        searchableItems = [];
        
        // 收集文本元素
        allTextElements.forEach(element => {
            const text = element.textContent.trim();
            if (text.length > 0) {
                searchableItems.push({
                    element: element,
                    text: text,
                    section: element.closest('.content-section').id
                });
            }
        });
        
        // 收集学习成果
        document.querySelectorAll('#learningGallery .gallery-item').forEach(item => {
            const title = item.querySelector('.gallery-item-title').textContent;
            
            searchableItems.push({
                element: item,
                text: title,
                section: 'gallery'
            });
        });
    }
    
    // 初始化搜索项
    updateSearchableItems();
    
    // 搜索功能
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        
        if (searchTerm === '') {
            searchResults.style.display = 'none';
            // 移除之前的高亮
            document.querySelectorAll('.highlight').forEach(el => {
                el.outerHTML = el.innerHTML;
            });
            return;
        }
        
        // 查找匹配项
        const matches = searchableItems.filter(item => 
            item.text.toLowerCase().includes(searchTerm)
        );
        
        if (matches.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">未找到匹配项</div>';
            searchResults.style.display = 'block';
            return;
        }
        
        // 显示搜索结果
        matches.forEach(match => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            // 截取包含搜索词的部分
            const index = match.text.toLowerCase().indexOf(searchTerm);
            const start = Math.max(0, index - 20);
            const end = Math.min(match.text.length, index + searchTerm.length + 20);
            let preview = match.text.substring(start, end);
            
            if (start > 0) preview = '...' + preview;
            if (end < match.text.length) preview = preview + '...';
            
            // 高亮搜索词
            preview = preview.replace(
                new RegExp(searchTerm, 'gi'), 
                match => `<span class="highlight">${match}</span>`
            );
            
            resultItem.innerHTML = preview;
            
            // 点击结果跳转到对应位置
            resultItem.addEventListener('click', function() {
                // 切换到对应板块
                navButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelector(`.nav-btn[data-target="${match.section}"]`).classList.add('active');
                
                contentSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === match.section) {
                        section.classList.add('active');
                    }
                });
                
                // 确保折叠内容展开
                const subsectionTitle = match.element.closest('.subsection-content')?.previousElementSibling;
                if (subsectionTitle && subsectionTitle.classList.contains('subsection-title')) {
                    subsectionTitle.classList.remove('collapsed');
                    subsectionTitle.nextElementSibling.classList.remove('collapsed');
                }
                
                const subsubsectionTitle = match.element.closest('.subsubsection-content')?.previousElementSibling;
                if (subsubsectionTitle && subsubsectionTitle.classList.contains('subsubsection-title')) {
                    subsubsectionTitle.classList.remove('collapsed');
                    subsubsectionTitle.nextElementSibling.classList.remove('collapsed');
                }
                
                // 滚动到匹配元素
                setTimeout(() => {
                    match.element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    
                    // 添加临时高亮
                    const originalHTML = match.element.innerHTML;
                    match.element.innerHTML = originalHTML.replace(
                        new RegExp(searchTerm, 'gi'), 
                        match => `<span class="highlight">${match}</span>`
                    );
                    
                    // 3秒后移除高亮
                    setTimeout(() => {
                        match.element.innerHTML = originalHTML;
                    }, 3000);
                }, 300);
                
                searchResults.style.display = 'none';
            });
            
            searchResults.appendChild(resultItem);
        });
        
        searchResults.style.display = 'block';
    }
    
    searchButton.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    // 点击页面其他地方关闭搜索结果
    document.addEventListener('click', function(e) {
        if (!searchResults.contains(e.target) && e.target !== searchInput && e.target !== searchButton) {
            searchResults.style.display = 'none';
        }
    });
    
    // 新增板块功能
    addSectionBtn.addEventListener('click', function() {
        addSectionModal.style.display = 'flex';
    });
    
    closeSectionModal.addEventListener('click', function() {
        addSectionModal.style.display = 'none';
    });
    
    addNewSection.addEventListener('click', function() {
        const sectionName = newSectionName.value.trim();
        if (sectionName) {
            // 生成ID
            const sectionId = 'section-' + Date.now();
            
            // 创建导航按钮
            const navButton = document.createElement('button');
            navButton.className = 'nav-btn';
            navButton.setAttribute('data-target', sectionId);
            navButton.textContent = sectionName;
            
            // 添加右键事件监听
            navButton.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                currentContextButton = this;
                contextMenu.style.display = 'block';
                contextMenu.style.left = e.pageX + 'px';
                contextMenu.style.top = e.pageY + 'px';
            });
            
            // 添加到导航栏
            addSectionBtn.parentNode.insertBefore(navButton, addSectionBtn);
            
            // 创建内容区域
            const contentSection = document.createElement('section');
            contentSection.id = sectionId;
            contentSection.className = 'content-section';
            contentSection.innerHTML = `
                <h2 class="section-title">${sectionName}</h2>
                <div class="key-point">
                    <h3><span class="number">01</span> ${sectionName}基础</h3>
                    <ul>
                        <li>这里是${sectionName}的基础内容</li>
                        <li>您可以根据需要添加更多内容</li>
                    </ul>
                </div>
                <a href="#" class="back-btn" data-target="home">返回首页</a>
            `;
            
            // 添加到页面
            document.querySelector('footer').parentNode.insertBefore(contentSection, document.querySelector('footer'));
            
            // 为新增的导航按钮添加点击事件
            navButton.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                
                // 更新活动按钮
                navButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // 显示对应内容区域
                contentSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) {
                        section.classList.add('active');
                    }
                });
                
                // 滚动到顶部
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            // 为新增的返回按钮添加事件
            contentSection.querySelector('.back-btn').addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector('.nav-btn[data-target="home"]').click();
            });
            
            // 更新导航按钮和内容区域的引用
            navButtons = document.querySelectorAll('.nav-btn');
            contentSections = document.querySelectorAll('.content-section');
            
            // 清空表单并关闭模态框
            newSectionName.value = '';
            addSectionModal.style.display = 'none';
        } else {
            alert('请输入板块名称');
        }
    });
    
    // 右键菜单功能
    renameSection.addEventListener('click', function() {
        if (currentContextButton) {
            renameSectionName.value = currentContextButton.textContent;
            renameModal.style.display = 'flex';
            contextMenu.style.display = 'none';
        }
    });
    
    deleteSection.addEventListener('click', function() {
        if (currentContextButton && confirm('确定要删除这个板块吗？')) {
            const targetId = currentContextButton.getAttribute('data-target');
            
            // 删除导航按钮
            currentContextButton.remove();
            
            // 删除内容区域
            const contentSection = document.getElementById(targetId);
            if (contentSection) {
                contentSection.remove();
            }
            
            // 重置活动按钮到首页
            document.querySelector('.nav-btn[data-target="home"]').click();
            
            contextMenu.style.display = 'none';
        }
    });
    
    closeRenameModal.addEventListener('click', function() {
        renameModal.style.display = 'none';
    });
    
    confirmRename.addEventListener('click', function() {
        const newName = renameSectionName.value.trim();
        if (newName && currentContextButton) {
            // 更新导航按钮文本
            currentContextButton.textContent = newName;
            
            // 更新内容区域的标题
            const targetId = currentContextButton.getAttribute('data-target');
            const contentSection = document.getElementById(targetId);
            if (contentSection) {
                const titleElement = contentSection.querySelector('.section-title');
                if (titleElement) {
                    titleElement.textContent = newName;
                }
            }
            
            renameModal.style.display = 'none';
        } else {
            alert('请输入新名称');
        }
    });
    
    // 点击页面其他地方关闭右键菜单
    document.addEventListener('click', function() {
        contextMenu.style.display = 'none';
    });
    
    // 学习成果功能
    addLearningOutcome.addEventListener('click', function() {
        learningOutcomeModal.style.display = 'flex';
        // 重置表单
        outcomeTitle.value = '';
        outcomeImagePreview.style.display = 'none';
        uploadedImage = null;
    });
    
    closeOutcomeModal.addEventListener('click', function() {
        learningOutcomeModal.style.display = 'none';
    });
    
    // 图片上传功能
    outcomeUploadBtn.addEventListener('click', function() {
        outcomeImageInput.click();
    });
    
    outcomeImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImage = event.target.result;
                outcomeImagePreview.src = uploadedImage;
                outcomeImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 拖拽上传功能
    outcomeImageUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    outcomeImageUpload.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });
    
    outcomeImageUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImage = event.target.result;
                outcomeImagePreview.src = uploadedImage;
                outcomeImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 保存学习成果
    saveLearningOutcome.addEventListener('click', function() {
        const title = outcomeTitle.value;
        
        if (title && uploadedImage) {
            // 创建学习成果数据
            const newOutcome = {
                title: title,
                image: uploadedImage
            };
            
            // 添加到存储
            learningOutcomes.push(newOutcome);
            localStorage.setItem('learningOutcomes', JSON.stringify(learningOutcomes));
            
            // 重新渲染
            renderLearningOutcomes();
            
            // 更新搜索项
            updateSearchableItems();
            
            // 关闭模态框
            learningOutcomeModal.style.display = 'none';
        } else {
            alert('请输入标题并上传图片');
        }
    });
  });
</script>
