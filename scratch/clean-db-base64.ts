import { prisma } from '../src/lib/prisma';
import { sanitizeImageUrl, sanitizeImageUrls } from '../src/lib/cloudinary';

async function main() {
  console.log('--- Cleaning database Base64 strings ---');

  // 1. Clean Profile
  const profile = await prisma.profile.findFirst();
  if (profile) {
    let updated = false;
    let newImg = profile.profileImage;
    if (profile.profileImage && profile.profileImage.startsWith('data:')) {
      newImg = await sanitizeImageUrl(profile.profileImage, 'portfolio/profile');
      updated = true;
    }
    if (updated) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { profileImage: newImg },
      });
      console.log('Cleaned Profile image.');
    }
  }

  // 2. Clean Projects
  const projects = await prisma.project.findMany();
  for (const proj of projects) {
    let updated = false;
    let newThumb = proj.thumbnail;
    let newImages = proj.projectImages;

    if (proj.thumbnail && proj.thumbnail.startsWith('data:')) {
      console.log(`Cleaning project thumbnail for: ${proj.title}`);
      newThumb = await sanitizeImageUrl(proj.thumbnail, 'portfolio/thumbnails');
      updated = true;
    }

    if (proj.projectImages && proj.projectImages.some((img) => img.startsWith('data:'))) {
      console.log(`Cleaning projectImages for: ${proj.title}`);
      newImages = await sanitizeImageUrls(proj.projectImages, 'portfolio/projects');
      updated = true;
    }

    if (updated) {
      await prisma.project.update({
        where: { id: proj.id },
        data: {
          thumbnail: newThumb,
          projectImages: newImages,
        },
      });
      console.log(`Updated project ${proj.id}`);
    }
  }

  // 3. Clean Case Studies
  const caseStudies = await prisma.caseStudy.findMany();
  for (const cs of caseStudies) {
    let updated = false;
    let newBpmn = cs.bpmn;
    let newUml = cs.uml;
    let newDb = cs.databaseDesign;
    let newScreenshots = cs.applicationScreenshots;

    if (cs.bpmn && cs.bpmn.startsWith('data:')) {
      newBpmn = await sanitizeImageUrl(cs.bpmn, 'portfolio/diagrams');
      updated = true;
    }
    if (cs.uml && cs.uml.startsWith('data:')) {
      newUml = await sanitizeImageUrl(cs.uml, 'portfolio/diagrams');
      updated = true;
    }
    if (cs.databaseDesign && cs.databaseDesign.startsWith('data:')) {
      newDb = await sanitizeImageUrl(cs.databaseDesign, 'portfolio/diagrams');
      updated = true;
    }
    if (cs.applicationScreenshots && cs.applicationScreenshots.some((s) => s.startsWith('data:'))) {
      newScreenshots = await sanitizeImageUrls(cs.applicationScreenshots, 'portfolio/screenshots');
      updated = true;
    }

    if (updated) {
      await prisma.caseStudy.update({
        where: { id: cs.id },
        data: {
          bpmn: newBpmn,
          uml: newUml,
          databaseDesign: newDb,
          applicationScreenshots: newScreenshots,
        },
      });
      console.log(`Updated CaseStudy for project ${cs.projectId}`);
    }
  }

  console.log('--- Database cleanup finished successfully ---');
}

main()
  .catch((e) => {
    console.error('Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
