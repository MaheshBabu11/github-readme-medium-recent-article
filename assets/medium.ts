export default ({ title, description, date, url, thumbnail }) => `
<svg fill="none" width="800" height="120" xmlns="http://www.w3.org/2000/svg">
	<foreignObject width="100%" height="100%">
		<div xmlns="http://www.w3.org/1999/xhtml">
			<style>
				*{
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: sans-serif
				}
        @keyframes gradientBackground {
					0% {
						background-position-x: 0%;
					}
					100% {
						background-position-x: 100%;
					}
				}
				.flex {
					display: flex;
					align-items:center;
        }
        .outer-container{
          height:120px;
        }
				.container{
          height: 118px;
          border: 1px solid rgba(0,0,0,.2);
          padding: 10px 20px;
          border-radius: 10px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          overflow: hidden;
          text-overflow: ellipsis;
        }
        img {
          margin-right: 10px;
          width: 150px;
          height: 100%;
          object-fit: cover;
        }
        .right{
          flex: 1;
        }
        a{
          text-decoration: none;
          color: inherit
        }
        p {
          line-height: 1.5;
          color: #555
        }
        h3{
          color: #333
        }
        small{
          color: #888;
          display: block;
          margin-top: 5px;
          margin-bottom: 8px
        }
				
			</style>
      <div class="outer-container flex">
        <a class="container flex" href="${url}" target="__blank">
					<img src="${thumbnail}"/>
          <div class="right">
            <h3>${title}</h3>
            <small>${date}</small>
            <p>${description}</p>
          </div>
				</a>
      </div>
		</div>
	</foreignObject>
</svg>
`;
