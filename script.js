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
    
    // GitHub 同步功能变量
    const githubSettingsBtn = document.getElementById('githubSettingsBtn');
    const githubSetupModal = document.getElementById('githubSetupModal');
    const closeGithubSetup = document.getElementById('closeGithubSetup');
    const saveGithubSetup = document.getElementById('saveGithubSetup');
    const githubToken = document.getElementById('githubToken');
    const githubRepo = document.getElementById('githubRepo');
    const githubBranch = document.getElementById('githubBranch');

    //同步配置相关
    const syncSettingsBtn = document.querySelector('.nav-btn[data-target="sync-settings"]');
    const syncStatus = document.getElementById('syncStatus');
    const configureSync = document.getElementById('configureSync');
    const clearConfig = document.getElementById('clearConfig');
    const testConnection = document.getElementById('testConnection');
    const forceSync = document.getElementById('forceSync');
    const syncHistory = document.getElementById('syncHistory');

    // 图片预览功能变量
    const imagePreviewModal = document.getElementById('imagePreviewModal');
    const previewImage = document.getElementById('previewImage');
    const previewTitle = document.getElementById('previewTitle');
    const closePreview = document.getElementById('closePreview');
    
    let currentContextButton = null;
    let uploadedImage = null;
    
    // GitHub 配置
    let githubConfig = JSON.parse(localStorage.getItem('githubConfig')) || null;

    // 同步历史记录
    let syncHistoryLogs = JSON.parse(localStorage.getItem('syncHistoryLogs')) || [];

    // 存储学习成果数据
    let learningOutcomes = JSON.parse(localStorage.getItem('learningOutcomes')) || [];
    
    // 初始化渲染学习成果
    renderLearningOutcomes();

    // 初始化同步设置
    initSyncSettings();

    // 渲染学习成果
    function renderLearningOutcomes() {
        const learningGallery = document.getElementById('learningGallery');
        learningGallery.innerHTML = '';
        
        learningOutcomes.forEach((outcome, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-title', outcome.title.toLowerCase());
            galleryItem.setAttribute('data-index', index);
            
            galleryItem.innerHTML = `
                <img src="${outcome.image}" alt="${outcome.title}">
                <div class="gallery-item-content">
                    <div class="gallery-item-title">${outcome.title}</div>
                    <div class="gallery-item-actions">
                        <button class="btn-edit" data-index="${index}">编辑</button>
                        <button class="btn-delete" data-index="${index}">删除</button>
                    </div>
                </div>
            `;
            learningGallery.appendChild(galleryItem);

            // 添加图片预览点击事件
            galleryItem.addEventListener('click', function(e) {
                // 防止编辑/删除按钮的点击触发预览
                if (!e.target.classList.contains('btn-edit') && !e.target.classList.contains('btn-delete')) {
                    openImagePreview(outcome.image, outcome.title);
                }
            });
        });

        // 添加删除和编辑事件监听
        addCardEventListeners();
    }

    // 图片预览功能
    function openImagePreview(imageSrc, title) {
        previewImage.src = imageSrc;
        previewTitle.textContent = title;
        imagePreviewModal.style.display = 'flex';
        
        // 禁用背景滚动
        document.body.style.overflow = 'hidden';
    }

    function closeImagePreview() {
        imagePreviewModal.style.display = 'none';
        
        // 恢复背景滚动
        document.body.style.overflow = '';
    }

    // 图片预览事件监听
    closePreview.addEventListener('click', closeImagePreview);

    // 点击模态框背景关闭预览
    imagePreviewModal.addEventListener('click', function(e) {
        if (e.target === imagePreviewModal) {
            closeImagePreview();
        }
    });

    // 按ESC键关闭预览
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && imagePreviewModal.style.display === 'flex') {
            closeImagePreview();
        }
    });

    // 为卡片添加编辑和删除事件监听
    function addCardEventListeners() {
        // 删除按钮事件
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation(); // 防止事件冒泡到卡片
                const index = parseInt(this.getAttribute('data-index'));
                deleteLearningOutcome(index);
            });
        });
        
        // 编辑按钮事件
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                editLearningOutcome(index);
            });
        });
    }

    // 删除学习成果
    async function deleteLearningOutcome(index) {
        if (confirm('确定要删除这个学习成果吗？')) {
            // 从数组中删除指定项
            learningOutcomes.splice(index, 1);
            
            // 更新本地存储
            localStorage.setItem('learningOutcomes', JSON.stringify(learningOutcomes));
            
            try {
                // 同步到 GitHub
                await syncLearningOutcomesToGitHub();
                addSyncHistory('success', '学习成果已删除并同步');
            } catch (error) {
                console.error('GitHub同步失败:', error);
                alert('删除成功，但GitHub同步失败: ' + error.message);
            }
            
            // 重新渲染
            renderLearningOutcomes();
            
            // 更新搜索项
            updateSearchableItems();
            
            alert('删除成功！');
        }
    }

    // 编辑学习成果
    function editLearningOutcome(index) {
        const outcome = learningOutcomes[index];
        
        // 填充表单数据
        outcomeTitle.value = outcome.title;
        outcomeImagePreview.src = outcome.image;
        outcomeImagePreview.style.display = 'block';
        uploadedImage = outcome.image;
        
        // 显示编辑模态框
        learningOutcomeModal.style.display = 'flex';
        
        // 临时存储当前编辑的索引
        learningOutcomeModal.setAttribute('data-editing-index', index);
        
        // 修改模态框标题
        document.querySelector('#learningOutcomeModal .modal-title').textContent = '编辑学习成果';
        
        // 修改保存按钮文本
        saveLearningOutcome.textContent = '更新';
    }
 
    // 初始化同步设置板块
    function initSyncSettings() {
        updateSyncStatus();
        renderSyncHistory();
        
        // 绑定同步设置板块内按钮的事件
        if (configureSync) {
            configureSync.addEventListener('click', function() {
                if (githubConfig) {
                    githubToken.value = githubConfig.token || '';
                    githubRepo.value = githubConfig.repo || '';
                    githubBranch.value = githubConfig.branch || 'main';
                } else {
                    githubToken.value = '';
                    githubRepo.value = '';
                    githubBranch.value = 'main';
                }
                githubSetupModal.style.display = 'flex';
            });
        }
        
        if (clearConfig) {
            clearConfig.addEventListener('click', function() {
                if (confirm('确定要清除所有同步配置吗？这将删除Token和仓库信息，但不会删除本地学习成果数据。')) {
                    githubConfig = null;
                    localStorage.removeItem('githubConfig');
                    localStorage.removeItem('lastSyncTime');
                    syncHistoryLogs = [];
                    localStorage.removeItem('syncHistoryLogs');
                    
                    updateSyncStatus();
                    renderSyncHistory();
                    addSyncHistory('warning', '同步配置已清除');
                    
                    alert('同步配置已清除');
                }
            });
        }
        
        if (testConnection) {
            testConnection.addEventListener('click', async function() {
                if (!githubConfig) {
                    alert('请先配置GitHub同步设置');
                    githubSetupModal.style.display = 'flex';
                    return;
                }
                
                const testBtn = testConnection;
                const originalText = testBtn.textContent;
                testBtn.textContent = '测试中...';
                testBtn.disabled = true;
                
                try {
                    // 测试获取仓库信息
                    const apiUrl = `https://api.github.com/repos/${githubConfig.repo}`;
                    const testResponse = await fetch(apiUrl, {
                        headers: {
                            'Authorization': `token ${githubConfig.token}`,
                        }
                    });
                    
                    if (testResponse.ok) {
                        const repoInfo = await testResponse.json();
                        addSyncHistory('success', '连接测试成功', `仓库: ${repoInfo.full_name}`);
                        alert('连接测试成功！GitHub同步配置正常。');
                    } else {
                        throw new Error(`HTTP ${testResponse.status}: ${testResponse.statusText}`);
                    }
                } catch (error) {
                    const errorMessage = handleGitHubError(error);
                    addSyncHistory('error', '连接测试失败', errorMessage);
                    alert('连接测试失败: ' + errorMessage);
                } finally {
                    testBtn.textContent = originalText;
                    testBtn.disabled = false;
                }
            });
        }
        
        if (forceSync) {
            forceSync.addEventListener('click', async function() {
                if (!githubConfig) {
                    alert('请先配置GitHub同步设置');
                    githubSetupModal.style.display = 'flex';
                    return;
                }
                
                const syncBtn = forceSync;
                const originalText = syncBtn.textContent;
                syncBtn.textContent = '同步中...';
                syncBtn.disabled = true;
                
                try {
                    // 先拉取最新数据
                    await syncFromGitHub();
                    
                    // 然后推送当前数据
                    await syncLearningOutcomesToGitHub();
                    
                    updateLastSyncTime();
                    addSyncHistory('success', '强制同步完成', '数据已成功同步到GitHub');
                    alert('强制同步完成！');
                } catch (error) {
                    const errorMessage = handleGitHubError(error);
                    addSyncHistory('error', '强制同步失败', errorMessage);
                    alert('强制同步失败: ' + errorMessage);
                } finally {
                    syncBtn.textContent = originalText;
                    syncBtn.disabled = false;
                }
            });
        }
    }

    // 更新同步状态显示
    function updateSyncStatus() {
        if (!syncStatus) return;
        
        if (!githubConfig) {
            syncStatus.innerHTML = `
                <div class="status-item">
                    <span class="status-label">状态:</span>
                    <span class="status-value disconnected">未配置</span>
                </div>
                <div class="status-item">
                    <span class="status-label">仓库:</span>
                    <span class="status-value">-</span>
                </div>
                <div class="status-item">
                    <span class="status-label">最后同步:</span>
                    <span class="status-value">-</span>
                </div>
            `;
            return;
        }

        const lastSync = localStorage.getItem('lastSyncTime') || '从未同步';
        const repoName = githubConfig.repo || '未设置';
        
        syncStatus.innerHTML = `
            <div class="status-item">
                <span class="status-label">状态:</span>
                <span class="status-value connected">已配置</span>
            </div>
            <div class="status-item">
                <span class="status-label">仓库:</span>
                <span class="status-value">${repoName}</span>
            </div>
            <div class="status-item">
                <span class="status-label">分支:</span>
                <span class="status-value">${githubConfig.branch || 'main'}</span>
            </div>
            <div class="status-item">
                <span class="status-label">最后同步:</span>
                <span class="status-value">${lastSync}</span>
            </div>
        `;
    }

    // 渲染同步历史
    function renderSyncHistory() {
        if (!syncHistory) return;
        
        syncHistory.innerHTML = '';
        
        if (syncHistoryLogs.length === 0) {
            syncHistory.innerHTML = '<div class="history-item">暂无同步记录</div>';
            return;
        }
        
        // 显示最近10条记录
        const recentLogs = syncHistoryLogs.slice(-10).reverse();
        
        recentLogs.forEach(log => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${log.type}`;
            
            const time = new Date(log.timestamp).toLocaleString();
            historyItem.innerHTML = `
                <strong>${time}</strong>: ${log.message}
                ${log.details ? `<br><small>${log.details}</small>` : ''}
            `;
            
            syncHistory.appendChild(historyItem);
        });
    }

    // 添加同步记录
    function addSyncHistory(type, message, details = '') {
        const log = {
            timestamp: new Date().toISOString(),
            type: type,
            message: message,
            details: details
        };
        
        syncHistoryLogs.push(log);
        
        // 只保留最近50条记录
        if (syncHistoryLogs.length > 50) {
            syncHistoryLogs = syncHistoryLogs.slice(-50);
        }
        
        localStorage.setItem('syncHistoryLogs', JSON.stringify(syncHistoryLogs));
        renderSyncHistory();
    }

    // 更新最后同步时间
    function updateLastSyncTime() {
        const now = new Date().toLocaleString();
        localStorage.setItem('lastSyncTime', now);
        updateSyncStatus();
    }

    // GitHub 错误处理函数
    function handleGitHubError(error) {
        console.error('GitHub错误:', error);
        
        if (error.message.includes('401') || error.message.includes('Bad credentials')) {
            addSyncHistory('error', 'Token已过期或无效', '请重新配置GitHub Token');
            setTimeout(() => {
                if (confirm('GitHub Token可能已过期或无效，是否立即重新配置？')) {
                    githubSetupModal.style.display = 'flex';
                }
            }, 1000);
            return 'Token已过期或无效，请重新配置';
        }
        
        if (error.message.includes('403')) {
            return '权限不足，请检查Token是否具有repo权限';
        }
        
        if (error.message.includes('404')) {
            return '仓库不存在或无法访问';
        }
        
        if (error.message.includes('422')) {
            return '数据格式错误或冲突';
        }
        
        if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
            return '网络连接失败，请检查网络设置';
        }
        
        return error.message || '未知错误';
    }
    
    // 从 GitHub 同步数据到本地
    async function syncFromGitHub() {
        if (!githubConfig) return;
        
        try {
            const remoteData = await loadLearningOutcomesFromGitHub();
            learningOutcomes = remoteData;
            localStorage.setItem('learningOutcomes', JSON.stringify(learningOutcomes));
            renderLearningOutcomes();
            addSyncHistory('success', '从GitHub拉取数据成功', `获取 ${remoteData.length} 个学习成果`);
        } catch (error) {
            const errorMessage = handleGitHubError(error);
            addSyncHistory('error', '从GitHub拉取数据失败', errorMessage);
            throw error;
        }
    }

    // 修改现有的 GitHub 设置保存函数
    saveGithubSetup.addEventListener('click', function() {
        const token = githubToken.value.trim();
        const repo = githubRepo.value.trim();
        const branch = githubBranch.value.trim() || 'main';
        
        if (!token || !repo) {
            alert('请填写完整的 GitHub 配置信息');
            return;
        }
        
        // 验证仓库格式
        if (!repo.includes('/')) {
            alert('仓库名格式应为: 用户名/仓库名');
            return;
        }
        
        githubConfig = {
            token: token,
            repo: repo,
            branch: branch
        };
        
        localStorage.setItem('githubConfig', JSON.stringify(githubConfig));
        githubSetupModal.style.display = 'none';
        
        updateSyncStatus();
        addSyncHistory('success', 'GitHub配置已保存', `仓库: ${repo}, 分支: ${branch}`);
        
        alert('GitHub 配置已保存！');
    });

    // 上传图片到 GitHub，添加错误处理包装
    async function uploadImageToGitHub(imageData, filename) {
        if (!githubConfig) {
            throw new Error('请先配置 GitHub 同步设置');
        }
        
        try {
            // 将 base64 数据转换为 blob
            const fetchResponse = await fetch(imageData);
            const blob = await fetchResponse.blob();
            
            // 准备上传
            const path = `images/${filename}`;
            const apiUrl = `https://api.github.com/repos/${githubConfig.repo}/contents/${path}`;
            
            // 将 blob 转换为 base64
            const base64Content = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            
            const commitMessage = `Add learning outcome image: ${filename}`;
            
            const uploadData = {
                message: commitMessage,
                content: base64Content,
                branch: githubConfig.branch
            };
            
            const uploadResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(uploadData)
            });
            
            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({}));
                throw new Error(errorData.message || `上传失败: ${uploadResponse.status}`);
            }
            
            const result = await uploadResponse.json();
            return result.content.download_url;
            
        } catch (error) {
            throw new Error(`图片上传失败: ${error.message}`);
        }
    }

    // 同步学习成果数据到 GitHub，添加更详细的错误处理
    async function syncLearningOutcomesToGitHub() {
        if (!githubConfig) {
            githubSetupModal.style.display = 'flex';
            throw new Error('请先完成 GitHub 同步设置');
        }
        
        const apiUrl = `https://api.github.com/repos/${githubConfig.repo}/contents/data/learning-outcomes.json`;
        const commitMessage = `Update learning outcomes: ${new Date().toLocaleString()}`;
        
        try {
            // 获取当前文件 SHA（如果存在）
            let sha = null;
            try {
                const currentFileResponse = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `token ${githubConfig.token}`,
                    }
                });
                if (currentFileResponse.ok) {
                    const fileData = await currentFileResponse.json();
                    sha = fileData.sha;
                }
            } catch (error) {
                // 文件不存在，正常创建
            }
            
            const content = btoa(JSON.stringify(learningOutcomes, null, 2));
            
            const uploadData = {
                message: commitMessage,
                content: content,
                branch: githubConfig.branch
            };
            
            if (sha) {
                uploadData.sha = sha;
            }
            
            const syncResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(uploadData)
            });
            
            if (!syncResponse.ok) {
                const errorData = await syncResponse.json().catch(() => ({}));
                throw new Error(errorData.message || `同步失败: ${syncResponse.status}`);
            }
            
            return true;
            
        } catch (error) {
            throw new Error(`数据同步失败: ${error.message}`);
        }
    }

    // 从 GitHub 加载学习成果
    async function loadLearningOutcomesFromGitHub() {
        if (!githubConfig) {
            // 如果没有配置，使用本地数据
            return JSON.parse(localStorage.getItem('learningOutcomes')) || [];
        }
        
        try {
            const apiUrl = `https://api.github.com/repos/${githubConfig.repo}/contents/data/learning-outcomes.json`;
            const loadResponse = await fetch(apiUrl, { // 重命名为 loadResponse
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                }
            });
            
            if (loadResponse.ok) {
                const fileData = await loadResponse.json();
                const content = JSON.parse(atob(fileData.content));
                
                // 同时更新本地存储
                localStorage.setItem('learningOutcomes', JSON.stringify(content));
                return content;
            } else {
                throw new Error('数据文件不存在');
            }
        } catch (error) {
            console.error('从GitHub加载失败:', error);
            // 回退到localStorage
            return JSON.parse(localStorage.getItem('learningOutcomes')) || [];
        }
    }

    // 保存学习成果 - 集成 GitHub 同步
    saveLearningOutcome.addEventListener('click', async function() {
        const title = outcomeTitle.value.trim();
        const editingIndex = learningOutcomeModal.getAttribute('data-editing-index');
        
        // 验证输入
        if (!title) {
            alert('请输入学习成果标题');
            outcomeTitle.focus();
            return;
        }
        
        if (!uploadedImage) {
            alert('请上传学习成果图片');
            return;
        }
        
        const saveBtn = saveLearningOutcome;
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '保存中...';
        saveBtn.disabled = true;

        try {
            // 如果有GitHub配置，先同步最新数据
            if (githubConfig) {
                try {
                    await syncFromGitHub();
                } catch (syncError) {
                    console.warn('同步最新数据失败，继续保存本地:', syncError);
                }
            }

            //再上传
            let imageUrl = uploadedImage;
             
            // 如果是 base64 图片且配置了GitHub，上传到 GitHub
            if (uploadedImage.startsWith('data:image') && githubConfig) {
                const filename = `outcome-${Date.now()}.png`;
                imageUrl = await uploadImageToGitHub(uploadedImage, filename);
                addSyncHistory('success', '图片上传成功', `文件: ${filename}`);
            }

            // 更新学习成果数据
            if (editingIndex !== null) {
                // 编辑模式
                const index = parseInt(editingIndex);
                learningOutcomes[index] = { title: title, image: imageUrl };
            } else {
                // 添加模式
                learningOutcomes.push({ title: title, image: imageUrl });
            }
            
            // 保存到 localStorage
            localStorage.setItem('learningOutcomes', JSON.stringify(learningOutcomes));
            
            // 如果有GitHub配置，同步到 GitHub
            if (githubConfig) {
                await syncLearningOutcomesToGitHub();
                updateLastSyncTime();
            }
            
            // 更新界面
            renderLearningOutcomes();
            updateSearchableItems();
            
            // 关闭模态框
            learningOutcomeModal.style.display = 'none';
            resetEditState();
            
            alert('保存成功！' + (githubConfig ? '已同步到GitHub。' : ''));
            
        } catch (error) {
            const errorMessage = handleGitHubError(error);
            alert(`保存失败: ${errorMessage}`);
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    });

    // 重置编辑状态
    function resetEditState() {
        learningOutcomeModal.removeAttribute('data-editing-index');
        document.querySelector('#learningOutcomeModal .modal-title').textContent = '添加学习成果';
        saveLearningOutcome.textContent = '保存';
        outcomeTitle.value = '';
        outcomeImagePreview.style.display = 'none';
        uploadedImage = null;
    }


    // 配置同步按钮事件
    configureSync.addEventListener('click', function() {
        if (githubConfig) {
            githubToken.value = githubConfig.token || '';
            githubRepo.value = githubConfig.repo || '';
            githubBranch.value = githubConfig.branch || 'main';
        } else {
            githubToken.value = '';
            githubRepo.value = '';
            githubBranch.value = 'main';
        }
        githubSetupModal.style.display = 'flex';
    });

    // 清除配置按钮事件
    clearConfig.addEventListener('click', function() {
        if (confirm('确定要清除所有同步配置吗？这将删除Token和仓库信息，但不会删除本地学习成果数据。')) {
            githubConfig = null;
            localStorage.removeItem('githubConfig');
            localStorage.removeItem('lastSyncTime');
            syncHistoryLogs = [];
            localStorage.removeItem('syncHistoryLogs');
            
            updateSyncStatus();
            renderSyncHistory();
            addSyncHistory('warning', '同步配置已清除');
            
            alert('同步配置已清除');
        }
    });

    // 测试连接按钮事件
    testConnection.addEventListener('click', async function() {
        if (!githubConfig) {
            alert('请先配置GitHub同步设置');
            githubSetupModal.style.display = 'flex';
            return;
        }
        
        const testBtn = testConnection;
        const originalText = testBtn.textContent;
        testBtn.textContent = '测试中...';
        testBtn.disabled = true;
        
        try {
            // 测试获取仓库信息
            const apiUrl = `https://api.github.com/repos/${githubConfig.repo}`;
            const testResponse = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                }
            });
            
            if (testResponse.ok) {
                const repoInfo = await testResponse.json();
                addSyncHistory('success', '连接测试成功', `仓库: ${repoInfo.full_name}`);
                alert('连接测试成功！GitHub同步配置正常。');
            } else {
                throw new Error(`HTTP ${testResponse.status}: ${testResponse.statusText}`);
            }
        } catch (error) {
            const errorMessage = handleGitHubError(error);
            addSyncHistory('error', '连接测试失败', errorMessage);
            alert('连接测试失败: ' + errorMessage);
        } finally {
            testBtn.textContent = originalText;
            testBtn.disabled = false;
        }
    });

    // 强制同步按钮事件
    forceSync.addEventListener('click', async function() {
        if (!githubConfig) {
            alert('请先配置GitHub同步设置');
            githubSetupModal.style.display = 'flex';
            return;
        }
        
        const syncBtn = forceSync;
        const originalText = syncBtn.textContent;
        syncBtn.textContent = '同步中...';
        syncBtn.disabled = true;
        
        try {
            // 先拉取最新数据
            await syncFromGitHub();
            
            // 然后推送当前数据
            await syncLearningOutcomesToGitHub();
            
            updateLastSyncTime();
            addSyncHistory('success', '强制同步完成', '数据已成功同步到GitHub');
            alert('强制同步完成！');
        } catch (error) {
            const errorMessage = handleGitHubError(error);
            addSyncHistory('error', '强制同步失败', errorMessage);
            alert('强制同步失败: ' + errorMessage);
        } finally {
            syncBtn.textContent = originalText;
            syncBtn.disabled = false;
        }
    });





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
                // 安全检查：确保元素在内容区域内
                const contentSection = element.closest('.content-section');
                if (contentSection && contentSection.id) {
                    searchableItems.push({
                        element: element,
                        text: text,
                        section: contentSection.id
                    });
                }
                // 如果不在内容区域内，静默跳过
            }
        });
        
        // 收集学习成果
        document.querySelectorAll('#learningGallery .gallery-item').forEach(item => {
            const titleElement = item.querySelector('.gallery-item-title');
            if (titleElement) {
                const title = titleElement.textContent;
                
                searchableItems.push({
                    element: item,
                    text: title,
                    section: 'gallery'
                });
            }
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
        resetEditState();
    });
    
    closeOutcomeModal.addEventListener('click', function() {
        learningOutcomeModal.style.display = 'none';
        resetEditState();
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

    // 点击模态框外部关闭
    learningOutcomeModal.addEventListener('click', function(e) {
        if (e.target === learningOutcomeModal) {
            learningOutcomeModal.style.display = 'none';
            resetEditState();
        }
    });

    // GitHub 设置模态框关闭
    closeGithubSetup.addEventListener('click', function() {
        githubSetupModal.style.display = 'none';
    });

    // 点击GitHub设置模态框外部关闭
    githubSetupModal.addEventListener('click', function(e) {
        if (e.target === githubSetupModal) {
            githubSetupModal.style.display = 'none';
        }
    });

});