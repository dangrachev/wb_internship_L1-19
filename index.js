const vkWidgetBlock = document.querySelector('.vk-widget-wrapper');
const vkWidgetPosts = document.querySelector('.vk-widget_posts');

// Вытаскиваем токен после авторизации
const token = window.location.hash.split("=")[1].split("&")[0]

// Функция загрузки постов из VK api
function getVKPosts() {
    const postsPerTime = 10;

    // Используем Open api и VK.Api.call для авторизации и вызова методов VK api
    VK.Api.call('wall.get', {
            owner_id: -103562966,
            domain: 'dangrachev',
            count: postsPerTime,
            offset: offset,
            access_token: token,
            v: 5.131
        },
        (res) => {

            if (res.response.ok) {
                const newPosts = res.response.items;

                // Проходимся по newPosts и создаем шаблон для каждого поста
                const html = newPosts.map((post) => `
                  <div class="vk-widget_post">
                    <img class="vk-widget_post-img" src=${post.attachments[0]['photo']?.sizes[4].url}>
                    <div class="vk-widget_post-title">${post.text}</div>
                    <div class="vk-widget_post-date">${new Date(post.date * 1000).toLocaleDateString()}</div>
                  </div>
            `).join('');

                // Добавляем новые посты
                vkWidgetPosts.insertAdjacentHTML('beforeend', html);
            }
        });
}

getVKPosts();