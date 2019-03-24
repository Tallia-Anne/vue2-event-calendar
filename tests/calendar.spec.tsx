import { shallowMount, mount, BaseWrapper } from '@vue/test-utils';
import Calendar from '../src/index.vue';
import data from '../dev/data';

interface IWrapperOptions {
  buttonPrefix: string;
  props: any;
  mountOptions?: any;
  handleMounted?: (wrapper: BaseWrapper) => void;
}

async function createDefaultWrapper({buttonPrefix, props, mountOptions, handleMounted}: IWrapperOptions) {
  const wrapper = shallowMount(Calendar, {
    ...mountOptions,
    propsData: {
      startDate: '2018-01-01',
      ...props
    }
  });

  if (!handleMounted) {
    const prev = wrapper.find(`.${buttonPrefix}-prev`);
    const next = wrapper.find(`.${buttonPrefix}-next`);
    const title = wrapper.find(`.${buttonPrefix}-header-date`);

    next.trigger('click');
    await wrapper.vm.$nextTick();
    expect(title.text()).toBe('2018-02');

    prev.trigger('click');
    await wrapper.vm.$nextTick();
    expect(title.text()).toBe('2018-01');
  } else {
    handleMounted(wrapper);
  }
}

// TODO:
// 1. test scope slots
describe('Calendar component', () => {
  test('component should match snapshot', () => {
    const wrapper = shallowMount(Calendar, {
      propsData: {
        startDate: new Date('2018-01-01'),
        dateData: data
      }
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('Change mode props', () => {
    const wrapper = shallowMount(Calendar, {
      propsData: {
        startDate: new Date('2018-01-01')
      }
    });

    const weekWrapper = shallowMount(Calendar, {
      propsData: {
        mode: 'week',
        startDate: new Date('2018-01-01')
      }
    });

    const monthRow = wrapper.findAll('.vue-calendar-body-row');
    const weekRow = weekWrapper.findAll('.vue-calendar-body-row');

    expect(monthRow.length).toBe(6);
    expect(weekRow.length).toBe(1);
  });

  test('has currect change action', () => {
    const prefixCls = 'kit-calendar';
    const props = { prefixCls };

    createDefaultWrapper({buttonPrefix: prefixCls, props});
  });

  test('renderHeader prop render currectly', () => {
    const props = {
      renderHeader({ prev, next, selectedDate }: any) {
        return (
          <div class='custom-header'>
            <div class='custom-header-prev' onClick={prev}>prev</div>
            <span class='custom-header-header-date'>{selectedDate}</span>
            <div class='custom-header-next' onClick={next}>next</div>
          </div>
        );
      }
    };

    createDefaultWrapper({buttonPrefix: 'custom-header', props});
  });

  test('scoped-slot should render currectly', () => {
    const component = {
      components: { Calendar },
      template: `
        <Calendar :startDate="startDate" :dateData="data">
          <div slot-scope="dateItem">
            <span>{{dateItem.date.date}} {{dateItem}}</span>
            <div
              v-for="(item, index) in dateItem.data"
              :key="index">
              {{ item.title }}
            </div>
          </div>
        </Calendar>
      `,
      data() {
        return {
          startDate: '2018-1-1',
          data: [
            {
              date: '2018-1-1',
              title: 'test scope-slot1'
            },
            {
              date: '2018-1-5',
              title: 'test scope-slot2'
            }
          ]
        };
      }
    };

    // console.log(shallow(component).element)
    expect(mount(component).element).toMatchSnapshot();
  });
});
