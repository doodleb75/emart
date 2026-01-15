const fs = require('fs');
const path = 'c:\\emart-everyday\\index.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Class based replacements
const icons = [
    'icon-arrow-more',
    'icon-arrow-right'
];

icons.forEach(icon => {
    const regex = new RegExp('<svg class="' + icon + '"[\\s\\S]*?<\\/svg>', 'g');
    content = content.replace(regex, '<i class="' + icon + '"></i>');
});

// 2. Specific string replacements for folder and megaphone
const folderSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
                                fill="none">
                                <g clip-path="url(#clip0_605_2649)">
                                    <path
                                        d="M8.33329 3.33301H3.33329C2.41663 3.33301 1.67496 4.08301 1.67496 4.99967L1.66663 14.9997C1.66663 15.9163 2.41663 16.6663 3.33329 16.6663H16.6666C17.5833 16.6663 18.3333 15.9163 18.3333 14.9997V6.66634C18.3333 5.74967 17.5833 4.99967 16.6666 4.99967H9.99996L8.33329 3.33301Z"
                                        fill="currentColor" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_605_2649">
                                        <rect width="20" height="20" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>`;

const megaphoneSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
                                fill="none">
                                <g clip-path="url(#clip0_605_2662)">
                                    <path
                                        d="M15 9.16634V10.833H18.3333V9.16634H15ZM13.3333 14.6747C14.1333 15.2663 15.175 16.0497 16 16.6663C16.3333 16.2247 16.6666 15.7747 17 15.333C16.175 14.7163 15.1333 13.933 14.3333 13.333C14 13.783 13.6666 14.233 13.3333 14.6747ZM17 4.66634C16.6666 4.22467 16.3333 3.77467 16 3.33301C15.175 3.94967 14.1333 4.73301 13.3333 5.33301C13.6666 5.77467 14 6.22467 14.3333 6.66634C15.1333 6.06634 16.175 5.29134 17 4.66634ZM3.33329 7.49967C2.41663 7.49967 1.66663 8.24967 1.66663 9.16634V10.833C1.66663 11.7497 2.41663 12.4997 3.33329 12.4997H4.16663V15.833H5.83329V12.4997H6.66663L10.8333 14.9997V4.99967L6.66663 7.49967H3.33329ZM12.9166 9.99967C12.9166 8.89134 12.4333 7.89134 11.6666 7.20801V12.783C12.4333 12.108 12.9166 11.108 12.9166 9.99967Z"
                                        fill="#444444" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_605_2662">
                                        <rect width="20" height="20" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>`;

// Use trim and escape to make sure they match
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

content = content.replace(folderSVG, '<i class="icon-folder"></i>');
content = content.replace(megaphoneSVG, '<i class="icon-megaphone"></i>');

fs.writeFileSync(path, content);
console.log('Final icons refactored successfully in index.html.');
