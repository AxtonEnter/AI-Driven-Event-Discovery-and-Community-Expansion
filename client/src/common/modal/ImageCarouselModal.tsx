import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Card,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


interface Props{
    isOpen: boolean;
    handleClose: () => void;
    images: string[];
}

export function ImageCarouselModal(props: Props){
    const fallbackImages = [
    'https://images.pexels.com/photos/160722/cat-tiger-getiegert-feel-at-home-160722.jpeg',
    'https://images.pexels.com/photos/32608192/pexels-photo-32608192/free-photo-of-charming-ginger-cat-with-potted-flowers-outdoors.jpeg',
    'https://images.pexels.com/photos/57416/cat-sweet-kitty-animals-57416.jpeg'
  ];

  const imagesToShow = props.images?.length ? props.images : fallbackImages;

  return (
    <Dialog
      open={props.isOpen}
      onClose={props.handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">Image Gallery</Typography>
        <IconButton onClick={props.handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {imagesToShow.map((src, index) => (
            <Card key={index} sx={{ overflow: 'hidden' }}>
              <img
                src={src}
                alt={`image-${index}`}
                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
              />
            </Card>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}