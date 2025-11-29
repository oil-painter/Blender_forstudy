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
        if (!confirm('确定要删除这个学习成果吗？')) {
            return;
        }
        
        const outcomeToDelete = learningOutcomes[index];
        console.log('开始删除学习成果:', index, outcomeToDelete);
        
        try {
            // 如果有 GitHub 配置且图片是 GitHub URL，删除图片文件
            if (githubConfig && outcomeToDelete.image && outcomeToDelete.image.includes('github.com')) {
                console.log('尝试删除 GitHub 图片...');
                await deleteImageFromGitHub(outcomeToDelete);
            } else {
                console.log('跳过图片删除（非 GitHub 图片或未配置 GitHub）');
            }
            
            // 从数组中删除指定项
            learningOutcomes.splice(index, 1);
            
            // 更新本地存储
            localStorage.setItem('learningOutcomes', JSON.stringify(learningOutcomes));
            
            // 同步到 GitHub
            if (githubConfig) {
                console.log('同步数据到 GitHub...');
                await syncLearningOutcomesToGitHub();
                addSyncHistory('success', '学习成果和图片已删除并同步');
            } else {
                addSyncHistory('success', '学习成果已删除');
            }
            
            // 重新渲染
            renderLearningOutcomes();
            
            // 更新搜索项
            updateSearchableItems();
            
            alert('删除成功！');
            
        } catch (error) {
            console.error('删除过程失败:', error);
            
            // 即使图片删除失败，也继续删除数据记录
            learningOutcomes.splice(index, 1);
            localStorage.setItem('learningOutcomes', JSON.stringify(learningOutcomes));
            
            if (githubConfig) {
                try {
                    await syncLearningOutcomesToGitHub();
                    addSyncHistory('warning', '学习成果已删除，但图片删除失败: ' + error.message);
                } catch (syncError) {
                    console.error('数据同步也失败:', syncError);
                    addSyncHistory('error', '学习成果删除不完整: ' + syncError.message);
                }
            }
            
            alert('学习成果已从数据中删除，但图片删除失败: ' + error.message);
        }
    }

    // 从 GitHub 删除图片文件,添加详细日志
    async function deleteImageFromGitHub(outcome) {
        if (!githubConfig) {
            throw new Error('GitHub 配置不存在');
        }
        
        console.log('开始删除图片处理:', outcome);
        
        // 确定文件路径
        let filePath = outcome.imagePath;
        
        // 如果没有存储的路径，尝试从 URL 提取
        if (!filePath && outcome.image) {
            console.log('从 URL 提取文件路径:', outcome.image);
            
            if (outcome.image.includes('raw.githubusercontent.com')) {
                const urlParts = outcome.image.split('/');
                const imagesIndex = urlParts.indexOf('images');
                if (imagesIndex !== -1) {
                    filePath = urlParts.slice(imagesIndex).join('/');
                    console.log('提取的文件路径:', filePath);
                }
            } else if (outcome.image.includes('github.com') && outcome.image.includes('/contents/')) {
                // 处理 GitHub 内容 URL
                const urlObj = new URL(outcome.image);
                filePath = urlObj.pathname.split('/contents/')[1];
                console.log('从内容 URL 提取的文件路径:', filePath);
            }
        }
        
        if (!filePath) {
            console.warn('无法确定图片文件路径:', outcome);
            throw new Error('无法确定要删除的图片文件路径');
        }
        
        try {
            console.log('准备删除图片文件:', filePath);
            
            // 第一步：获取文件信息
            const fileInfoUrl = `https://api.github.com/repos/${githubConfig.repo}/contents/${filePath}`;
            console.log('获取文件信息的 URL:', fileInfoUrl);
            
            const fileResponse = await fetch(fileInfoUrl, {
                headers: {
                    'Authorization': `Bearer ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            console.log('文件信息响应状态:', fileResponse.status);
            
            if (!fileResponse.ok) {
                if (fileResponse.status === 404) {
                    console.log('图片文件不存在，无需删除');
                    return; // 文件不存在，直接返回成功
                }
                
                let errorMessage = `获取文件信息失败: ${fileResponse.status}`;
                try {
                    const errorData = await fileResponse.json();
                    errorMessage += ` - ${errorData.message}`;
                    console.error('GitHub API 错误详情:', errorData);
                } catch (e) {
                    // 忽略 JSON 解析错误
                }
                throw new Error(errorMessage);
            }
            
            const fileData = await fileResponse.json();
            console.log('获取到的文件信息:', fileData);
            
            const fileSha = fileData.sha;
            if (!fileSha) {
                throw new Error('无法获取文件 SHA');
            }
            
            console.log('获取到文件 SHA:', fileSha);
            
            // 第二步：删除文件
            const deleteUrl = `https://api.github.com/repos/${githubConfig.repo}/contents/${filePath}`;
            console.log('删除文件的 URL:', deleteUrl);
            
            const deleteResponse = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Delete learning outcome image: ${filePath.split('/').pop()}`,
                    sha: fileSha,
                    branch: githubConfig.branch || 'main'
                })
            });
            
            console.log('删除响应状态:', deleteResponse.status);
            
            if (!deleteResponse.ok) {
                let errorMessage = `删除文件失败: ${deleteResponse.status}`;
                try {
                    const errorData = await deleteResponse.json();
                    errorMessage += ` - ${errorData.message}`;
                    console.error('删除失败详情:', errorData);
                } catch (e) {
                    // 忽略 JSON 解析错误
                }
                throw new Error(errorMessage);
            }
            
            const deleteResult = await deleteResponse.json();
            console.log('删除成功:', deleteResult);
            
            addSyncHistory('success', '图片文件已删除', `文件: ${filePath}`);
            
        } catch (error) {
            console.error('图片删除完整错误:', error);
            throw error;
        }
    }

    // 辅助函数：从 URL 中提取文件路径
    function extractFilePathFromUrl(imageUrl) {
        if (!imageUrl) return null;
        
        if (imageUrl.includes('raw.githubusercontent.com')) {
            const urlParts = imageUrl.split('/');
            const imagesIndex = urlParts.indexOf('images');
            if (imagesIndex !== -1) {
                return urlParts.slice(imagesIndex).join('/');
            }
        }
        
        return null;
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
        
        // 添加手动清理按钮
        const cleanupOrphanImages = document.createElement('button');
        cleanupOrphanImages.className = 'btn btn-warning';
        cleanupOrphanImages.textContent = '清理孤立图片';
        cleanupOrphanImages.id = 'cleanupOrphanImages';
        
        // 插入到同步操作按钮中
        document.querySelector('.sync-actions').appendChild(cleanupOrphanImages);
        
        // 添加事件监听
        cleanupOrphanImages.addEventListener('click', async function() {
            if (!githubConfig) {
                alert('请先配置 GitHub 同步设置');
                return;
            }
            
            if (!confirm('这将扫描并删除所有不再被学习成果引用的图片文件。确定要继续吗？')) {
                return;
            }
            
            const cleanupBtn = cleanupOrphanImages;
            const originalText = cleanupBtn.textContent;
            cleanupBtn.textContent = '清理中...';
            cleanupBtn.disabled = true;
            
            try {
                await cleanupOrphanedImages();
                alert('孤立图片清理完成！');
            } catch (error) {
                console.error('清理失败:', error);
                alert('清理失败: ' + error.message);
            } finally {
                cleanupBtn.textContent = originalText;
                cleanupBtn.disabled = false;
            }
        });
    
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
            return '权限不足，请检查Token是否具有repo权限，或者仓库是否为私有仓库（Token需要具有访问私有仓库的权限）';
        }

        if (error.message.includes('404')) {
            return '仓库不存在或无法访问，请检查仓库名是否正确（格式：用户名/仓库名）';
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

    // GitHub 设置保存函数
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
            // 直接使用 base64 数据，无需转换
            const base64Content = imageData.split(',')[1];
            
            if (!base64Content) {
                throw new Error('图片数据格式错误');
            }
            
            const path = `images/${filename}`;
            const apiUrl = `https://api.github.com/repos/${githubConfig.repo}/contents/${path}`;
            
            const commitMessage = `Add learning outcome image: ${filename}`;
            
            const uploadData = {
                message: commitMessage,
                content: base64Content,
                branch: githubConfig.branch || 'main'
            };
            
            console.log('上传图片到:', apiUrl);
            
            const uploadResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(uploadData)
            });
            
            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('上传响应错误:', uploadResponse.status, errorText);
                throw new Error(`上传失败: ${uploadResponse.status} - ${errorText}`);
            }
            
            const result = await uploadResponse.json();
            console.log('图片上传成功:', result);
            return result.content.download_url;
            
        } catch (error) {
            console.error('图片上传完整错误:', error);
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
                    console.log('获取到文件 SHA:', sha);
                } else if (currentFileResponse.status !== 404) {
                    // 404 是正常的，文件不存在
                    throw new Error(`获取文件失败: ${currentFileResponse.status}`);
                }
            } catch (error) {
                if (!error.message.includes('404')) {
                    console.error('获取 SHA 错误:', error);
                    throw error;
                }
            }
            
            // 确保数据是有效的 JSON
            const jsonData = JSON.stringify(learningOutcomes, null, 2);
            const content = btoa(unescape(encodeURIComponent(jsonData)));
            
            const uploadData = {
                message: commitMessage,
                content: content,
                branch: githubConfig.branch || 'main'
            };
            
            if (sha) {
                uploadData.sha = sha;
            }
            
            console.log('同步数据到 GitHub:', uploadData);
            
            const syncResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(uploadData)
            });
            
            if (!syncResponse.ok) {
                const errorText = await syncResponse.text();
                console.error('同步响应错误:', syncResponse.status, errorText);
                throw new Error(`同步失败: ${syncResponse.status} - ${errorText}`);
            }
            
            const result = await syncResponse.json();
            console.log('数据同步成功:', result);
            return true;
            
        } catch (error) {
            console.error('数据同步完整错误:', error);
            throw new Error(`数据同步失败: ${error.message}`);
        }
    }

    // 从 GitHub 加载学习成果
    async function loadLearningOutcomesFromGitHub() {
        if (!githubConfig) {
            console.log('未配置 GitHub，使用本地数据');
            return JSON.parse(localStorage.getItem('learningOutcomes')) || [];
        }
        
        try {
            const apiUrl = `https://api.github.com/repos/${githubConfig.repo}/contents/data/learning-outcomes.json`;
            console.log('从 GitHub 加载数据:', apiUrl);
            
            const loadResponse = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                }
            });
            
            if (loadResponse.ok) {
                const fileData = await loadResponse.json();
                const content = decodeURIComponent(escape(atob(fileData.content)));
                const parsedData = JSON.parse(content);
                
                console.log('从 GitHub 加载到数据:', parsedData);
                
                // 同时更新本地存储
                localStorage.setItem('learningOutcomes', JSON.stringify(parsedData));
                return parsedData;
            } else if (loadResponse.status === 404) {
                console.log('GitHub 上尚未有数据文件，使用本地数据');
                return JSON.parse(localStorage.getItem('learningOutcomes')) || [];
            } else {
                throw new Error(`HTTP ${loadResponse.status}: ${loadResponse.statusText}`);
            }
        } catch (error) {
            console.error('从 GitHub 加载失败:', error);
            // 回退到 localStorage
            return JSON.parse(localStorage.getItem('learningOutcomes')) || [];
        }
    }

    // 保存学习成果 - 集成 GitHub 同步，添加调试信息
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
            console.log('开始保存学习成果...');
            
            // 如果有GitHub配置，先同步最新数据
            if (githubConfig) {
                try {
                    console.log('从 GitHub 同步最新数据...');
                    await syncFromGitHub();
                } catch (syncError) {
                    console.warn('同步最新数据失败，继续保存本地:', syncError);
                }
            }

            let imageUrl = uploadedImage;
            let imagePath = null; // 新增：记录图片路径

            // 如果是 base64 图片且配置了GitHub，上传到 GitHub
            if (uploadedImage.startsWith('data:image') && githubConfig) {
                const filename = `outcome-${Date.now()}.png`;
                console.log('上传图片到 GitHub:', filename);
                imageUrl = await uploadImageToGitHub(uploadedImage, filename);
                imagePath = `images/${filename}`; // 记录路径用于后续删除
                addSyncHistory('success', '图片上传成功', `文件: ${filename}`);
            }

            // 更新学习成果数据，同时存储图片路径
            const outcomeData = { 
                title: title, 
                image: imageUrl,
                imagePath: imagePath // 新增：存储图片路径
            };

            if (editingIndex !== null) {
                // 编辑模式
                const index = parseInt(editingIndex);
                learningOutcomes[index] = outcomeData;
                console.log('更新学习成果:', index, title);
            } else {
                // 添加模式
                learningOutcomes.push(outcomeData);
                console.log('添加新学习成果:', title);
            }
            
            // 保存到 localStorage
            localStorage.setItem('learningOutcomes', JSON.stringify(learningOutcomes));
            console.log('保存到本地存储完成');
            
            // 如果有GitHub配置，同步到 GitHub
            if (githubConfig) {
                console.log('同步数据到 GitHub...');
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
            console.error('保存失败完整错误:', error);
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
        
        // 添加加载状态样式
        testBtn.classList.add('loading');
        
        try {
            // 测试获取仓库信息
            const apiUrl = `https://api.github.com/repos/${githubConfig.repo}`;
            const testResponse = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (testResponse.ok) {
                const repoInfo = await testResponse.json();
                addSyncHistory('success', '连接测试成功', `仓库: ${repoInfo.full_name}, 默认分支: ${repoInfo.default_branch}`);
                
                // 额外测试写入权限
                await testWritePermission();
                
                alert('连接测试成功！GitHub同步配置正常。');
                
            } else {
                let errorDetail = '';
                switch (testResponse.status) {
                    case 401:
                        errorDetail = 'Token无效或已过期';
                        break;
                    case 403:
                        errorDetail = '权限不足，Token可能需要repo权限';
                        break;
                    case 404:
                        errorDetail = `仓库 "${githubConfig.repo}" 不存在，请检查仓库名格式（用户名/仓库名）`;
                        break;
                    default:
                        errorDetail = `HTTP ${testResponse.status}: ${testResponse.statusText}`;
                }
                throw new Error(errorDetail);
            }
        } catch (error) {
            const errorMessage = handleGitHubError(error);
            addSyncHistory('error', '连接测试失败', errorMessage);
            alert('连接测试失败: ' + errorMessage);
        } finally {
            // 确保无论成功还是失败都会恢复按钮状态
            testBtn.textContent = originalText;
            testBtn.disabled = false;
            testBtn.classList.remove('loading');
            console.log('测试按钮状态已恢复'); // 调试信息
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


    // 清理孤立图片函数
    async function cleanupOrphanedImages() {
        if (!githubConfig) {
            throw new Error('GitHub 配置不存在');
        }
        
        console.log('开始清理孤立图片...');
        
        try {
            // 获取 images 文件夹内容
            const imagesUrl = `https://api.github.com/repos/${githubConfig.repo}/contents/images`;
            const imagesResponse = await fetch(imagesUrl, {
                headers: {
                    'Authorization': `Bearer ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!imagesResponse.ok) {
                if (imagesResponse.status === 404) {
                    console.log('images 文件夹不存在，无需清理');
                    addSyncHistory('info', '清理完成', 'images 文件夹不存在');
                    return;
                }
                throw new Error(`获取 images 文件夹失败: ${imagesResponse.status}`);
            }
            
            const imagesData = await imagesResponse.json();
            console.log('找到的图片文件:', imagesData);
            
            // 收集所有学习成果中使用的图片路径
            const usedImagePaths = new Set();
            learningOutcomes.forEach(outcome => {
                if (outcome.imagePath) {
                    usedImagePaths.add(outcome.imagePath);
                }
            });
            
            console.log('正在使用的图片路径:', usedImagePaths);
            
            let deletedCount = 0;
            let errorCount = 0;
            
            // 检查每个图片文件是否还在使用
            for (const imageFile of imagesData) {
                if (imageFile.type !== 'file') continue;
                
                const imagePath = `images/${imageFile.name}`;
                
                if (!usedImagePaths.has(imagePath)) {
                    console.log(`发现孤立图片: ${imagePath}`);
                    
                    try {
                        // 删除孤立图片
                        const deleteUrl = `https://api.github.com/repos/${githubConfig.repo}/contents/${imagePath}`;
                        const deleteResponse = await fetch(deleteUrl, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${githubConfig.token}`,
                                'Accept': 'application/vnd.github.v3+json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                message: `Cleanup orphaned image: ${imageFile.name}`,
                                sha: imageFile.sha,
                                branch: githubConfig.branch || 'main'
                            })
                        });
                        
                        if (deleteResponse.ok) {
                            console.log(`成功删除孤立图片: ${imagePath}`);
                            deletedCount++;
                        } else {
                            console.error(`删除孤立图片失败: ${imagePath}`, deleteResponse.status);
                            errorCount++;
                        }
                    } catch (error) {
                        console.error(`删除孤立图片异常: ${imagePath}`, error);
                        errorCount++;
                    }
                }
            }
            
            addSyncHistory('success', '孤立图片清理完成', `删除了 ${deletedCount} 个文件，${errorCount} 个错误`);
            console.log(`清理完成: 删除了 ${deletedCount} 个孤立图片，${errorCount} 个错误`);
            
        } catch (error) {
            console.error('清理过程失败:', error);
            addSyncHistory('error', '孤立图片清理失败', error.message);
            throw error;
        }
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
